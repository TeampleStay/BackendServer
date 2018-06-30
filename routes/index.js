const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// mongoose
const soundSchema = require('../models/Sound');
const TagSchema = require('../models/Tag');

// multer
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({
    storage: storage
});


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/upload', function(req, res, next) {
   res.render('upload');
});

router.get('/uploads/:filename', function(req, res, next) {
    res.download(path.join(__dirname, '../uploads/', req.params.filename))
});

router.post('/upload/photos',
    upload.any(), function(req, res, next) {
    let time = Date.now();
    let workspace = path.join(__dirname, '/uploads');
    let promiseAll = [];
    console.log(req.files);

    for(let i = 0; i < req.files.length; i++) {
        let file = req.files[i];
        console.log("file: ", file);
        let p = new Promise((resolve, reject) => {
            console.log(file.destination, '/image0'+i+'.jpg')
            fs.rename(file.path, file.destination+'/image0'+i+'.jpg', function(err) {
                if(err) reject(err);
                else resolve('image0'+i+'.jpg');
            })
        });
        console.log("push promise");
        promiseAll.push(p);
    }

    Promise.all(promiseAll)
        .then(function(data) {
        console.log("POST /uploads/photos: ", data);
        res.send('ok');
    })
});

router.post('/upload',
    upload.fields([
    {name: 'soundFile', maxCount: 1},
    {name: 'specific', maxCount: 200}
    ]), function(req, res, next) {

    let time = new Date();
    let specific = req.body.specific.split(',');
    let dst = req.files['soundFile'][0].path;
    let filename = req.files['soundFile'][0].filename;
    console.log("POST: /upload: " + "filename: " + filename + " dst: " + dst + " specific: " + specific);

    soundSchema.create({
        filename: filename,
        dst: dst,
        createOn: time,
        specific: specific
    }, (err, sound) => {
        if (err) console.log(time, " POST /uploads ERR : ", err);
        console.log(time, ' POST /uploads : ', filename, ' are uploads in ', dst);

        let promiseAllArr = [];
        for(let i = 0; i < specific.length; i++) {
            promiseAllArr.push(findTagNameOrCreate(specific[i], sound));
        }

        Promise.all(promiseAllArr)
            .then(function(val) {
                console.log(time, 'POST /uploads : Promise result ', val);
                res.send(val);
            });
    })
});

function findTagNameOrCreate(_tagName, soundObj) {
    return new Promise(function(resolve, reject) {
        TagSchema.findOne({tagName: _tagName}, (err, tag) => {
            if(err) reject({
                id: null,
                data: err
            });
            else {
                if(tag == null) {
                    TagSchema.create({
                        tagName: _tagName,
                        soundArr: [soundObj]
                    }).then(() => {
                        resolve({
                            soundId: soundObj._id,
                            tag: _tagName,
                            data: "create Tag and update"
                        });
                    });
                } else {
                    TagSchema.update(
                        {_id: tag._id},
                        {$push: {
                            soundArr: soundObj
                            }},
                    ).then(() => {
                        resolve({
                            soundId: soundObj._id,
                            tag: _tagName,
                            data: "Update in Tag"
                        });
                    });
                }
            }
        })
    })
}

module.exports = router;
