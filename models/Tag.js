const mongoClient = require('mongoose');

const TagSchema = new mongoClient.Schema({
    tagName: {
        type: String,
        required: true
    },
    soundTitle: {
        type: [Schema.Types.ObjectId]
    }
});

module.exports = mongoClient.model('tags', SoundSchema);