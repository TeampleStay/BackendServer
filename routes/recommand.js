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
    let photoSource = req.body;

    let psKeyArr = Object.keys(photoSource);
    let resultMapObj = {};

    console.log("Photo Tag: ", psKeyArr);

    let cnt = 0;
    let promiseAllArr = [];
    psKeyArr.forEach((v, i) => {
        promiseAllArr.push(findTagandCalRank(v, resultMapObj));
    });

    Promise.all(promiseAllArr)
    .then(function(val) {
        console.log('POST /recommand/music : Promise ', val, " -  ", time);
        console.log("POST /recommand/music :" + "resultMapObj: ", resultMapObj);
        let top = topkObj(resultMapObj);

        //res.json(top);

        let photoCnt = photoSource['cnt'];
        execffmpeg(top, photoCnt, function(file) {
            if (file === null)
                res.status(400).send("no file");
            else
                res.send(file);
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

function execffmpeg(topAudioList, photoCnt, callback) {
    let workDir = path.join(__dirname, '../uploads');

    let data = 'ffconcat version 1.0\n';
    let i = 0;
    for(; i < photoCnt - 1; i++) {
        data += 'file' + ' image0' + i + '.jpg\n';
        data += 'duration ' + 5 + '\n';
    }
    data += 'file' + ' image0' + i + '.jpg\n';
    console.log("in.ffconcat: ", data);
    fs.writeFile(workDir + '/in.ffconcat', data, function(err) {
        if (err) console.log("execffmpeg: ", err);
        else {
            console.log("write data in in.ffconcat");
            let query = "";
            let outfile = Date.now() + "out.mp4";
            if(topAudioList[0] === undefined) {
                query = 'ffmpeg -i ' + workDir + '/in.ffconcat -i ' + workDir +'/'+ '1530243265582Get_Outside\\ \\(mp3cut.net\\).mp3' + ' -c:a copy -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ./uploads/' + outfile;
            } else {
                query = 'ffmpeg -i ' + workDir + '/in.ffconcat -i "' + workDir +'/'+ topAudioList[0].filename + '" -c:a copy -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ./uploads/' + outfile;
            }
            console.log("query: ", query);
            let cmd = exec(query, function(err, stdout, stderr) {
                if(err) {
                    console.log("ffmpeg error: ", err);
                    callback(null);
                } else {
                    console.log("ffmpeg excute");
                    console.log("stdout: ", stdout);
                    callback("http://52.78.159.170:3000/uploads" +'/'+ outfile);
                }
            });
        }
    });
}

module.exports = router;