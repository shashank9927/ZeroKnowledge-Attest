const mongoose = require('mongoose');
const crypto = require('crypto');

const verificationTokenSchema = new mongoose.Schema({    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required:true 
    },
    token: {
        type: String,
        required: true,
        unique: true 
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    },

    usageLimit: {
        type: Number,
        default: 5,
        min: 1
    },

    usageCount: {
        type: Number,
        default: 0 
    },
    createdAt: {
        type: Date,
        default: Date.now 
    }
});

//check if token has exceeded usage limit
verificationTokenSchema.methods.isExhausted = function() {
    return this.usageCount >= this.usageLimit;
};

//check if token is valid and not exhausted
verificationTokenSchema.methods.isValid = function() {
    return !this.isExhausted();
};

verificationTokenSchema.methods.incrementUsage = async function() {
    this.usageCount += 1;
    return await this.save();
}

//generate random token string
verificationTokenSchema.statics.generateTokenString = function() {
    return crypto.randomBytes(16).toString('hex');
};

module.exports = mongoose.model('VerificationToken', verificationTokenSchema);

