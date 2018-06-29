const mongoClient = require('mongoose');

const TagSchema = new mongoClient.Schema({
    tagName: {
        type: String,
        required: true
    },
    soundArr: {
        type: Array, default: []
    }
});

module.exports = mongoClient.model('tags', TagSchema);