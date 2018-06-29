const mongoClient = require('mongoose');

const SoundSchema = new mongoClient.Schema({
    filename: {
        type: String,
        required: true
    },
    dst: {
        type: String,
        required: true
    },
    createOn: {
        type: Date,
        required: true
    },
    specific: {
        type: [String],
        required: true
    }
});