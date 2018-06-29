const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// mongoose
const soundSchema = require('../models/Sound');

// multer
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function(req, file, cb) {
        cb(null, Date.now()+ file.originalname);
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
    let sound = fs.createReadStream(path.join(__dirname, '../uploads/', req.params.filename));
    sound.pipe(res);
});

router.post('/upload', upload.fields([{
    name: 'soundFile', maxCount: 1
}, {
    name: 'specific'
}]), function(req, res, next) {
    let time = new Date();
    let specific = req.body.specific;
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
        res.send("success");
    })
});

module.exports = router;
