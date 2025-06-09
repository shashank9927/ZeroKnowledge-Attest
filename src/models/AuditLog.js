const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema( {
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['view', 'verify', 'verify_public',
            'update', 'delete', 'create',
            'generate_token', 'delete_token'
        ],

    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    success: {
        type: Boolean,
        required: true,
        default: true 
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

auditLogSchema.index({documentId: 1, timestamp: -1});
auditLogSchema.index({userId: 1, timestamp: -1});

module.exports = mongoose.model('AuditLog', auditLogSchema);