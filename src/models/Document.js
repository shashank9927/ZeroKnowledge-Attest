const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true 
    },
    description: {
        type: String,
        required: true 
    },
    filename: {
        type: String,
        required: true 
    },
    hash: {
        type: String,
        required: true,

    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Document', documentSchema);