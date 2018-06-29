const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// mongoose
const TagSchema = require('../models/Tag');


router.post('/music', function (req, res, next) {
    let time = new Date();
    let photoSource = req.body;
    let psKeyArr = Object.keys(photoSource);
    let resultMapObj = {};

    let cnt = 0;
    let promiseAllArr = [];
    psKeyArr.forEach((v, i) => {
        promiseAllArr.push(findTagandCalRank(v, resultMapObj));
    });

    Promise.all(promiseAllArr)
        .then(function(val) {
            console.log(time, ' POST /recommand/music : Promise ', val);
            console.log("resultMapObj: ", resultMapObj);
            let top = topkObj(resultMapObj);

            res.json(top);
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
                    console.log(soundArr);
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