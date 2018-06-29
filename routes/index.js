const express = require('express');
const router = express.Router();

// mongoose


// multer
const multer = require('multer');
const storage = multer.diskStorage({
    destinamtion: function(req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function(req, file, cb) {
        let filename = req.body.filename;
        cb(null, filename);
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

router.post('/upload', upload.single('soundFile'), function(req, res, next) {
    let time = new Date();
    let specific = req.body.specific;
    let dst = req.file.destination;


    console.log(time, " POST /uploads : ", req.file, " are uploads in ", req.file.dest)

    res.send("success");
});

module.exports = router;
