const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;

// mongoose
const TagSchema = require('../models/Tag');

router.get('/', function(req, res, next) {

});

router.post('/music', function (req, res, next) {
    let time = new Date();
    let photoData = req.body;
    let photoSource = {};
    photoData.forEach((val, index) => {
        photoSource[val.description] = val.score;
    });

    let psKeyArr = Object.keys(photoSource);
    let resultMapObj = {};

    let cnt = 0;
    let promiseAllArr = [];
    psKeyArr.forEach((v, i) => {
        promiseAllArr.push(findTagandCalRank(v, resultMapObj));
    });

    Promise.all(promiseAllArr)
    .then(function(val) {
        console.log(' POST /recommand/music : Promise ', val, " -  ", time);
        console.log("POST /recommand/music :" + "resultMapObj: ", resultMapObj);
        let top = topkObj(resultMapObj);

        let ffconcat = fs.createWriteStream('in.ffmpeg');
        ffconcat.write('ffconcat version 1.0\n' +
            'file image01.png\n' +
            'duration 3\n' +
            'file image02.png\n' +
            'duration 5\n' +
            'file image03.png');
        ffconcat.end();
        exec('ffmpeg -i in.ffmpeg -i ./' + top[0].filename + ' -c:a copy -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" out.mp4', function(err, stdout, stderr) {
            console.log("Stdout: ", stdout);
            res.send('ok');
        })
    });
});

function topkObj(obj, k) {
    let top = [];

    Object.keys(obj).forEach((v, i) => {
        top.push({filename: v, value: Object.values(obj)[i]})
    });

    top.sort(function(a, b) {
        return (a.value < b.value) ? 1 : (a.value > b.value) ? -1 : 0;
    });

    return top;
}

function findTagandCalRank(_tagName, resultMapObj) {
    return new Promise(function (resolve, reject) {
        TagSchema.find({tagName: _tagName}, (err, tag) => {
            if(err) reject(err);
            else {
                if(tag.length == 0 || tag == null)
                    resolve('null');
                else {
                    let soundArr = tag[0].soundArr;
                    for(let i = 0; i < soundArr.length; i++) {
                        let filename = soundArr[i].filename;

                        resultMapObj[filename] = (resultMapObj[filename] === undefined) ? 1 : ++resultMapObj[filename];
                    }
                    resolve('finish');
                }
            }
        })
    })
}

module.exports = router;