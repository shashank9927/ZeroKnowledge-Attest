const AuditLog = require('../models/AuditLog');

async function logDocumentAccess(options) {
    try {
        const auditEntry = new AuditLog({
            documentId: options.documentId,
            action: options.action,
            userId: options.userId || null,
            success: options.success !== undefined ? options.success : true,
            details: options.details || {}
        });

        await auditEntry.save();
        return auditEntry;
    }
    catch(err) {
        console.error(`Error creating audit log: ${err}`);
        return null;
    }
}

//get all audit log for a specific document

async function getDocumentAuditLogs(documentId) {
    try {
        return await AuditLog
                        .find({documentId})
                        .sort({timestamp: -1})
                        .populate('userId', 'name email').lean();
    }
    catch(err) {
        console.error('Error retrieving audit logs: ',err);
        throw err;
    }
}

//get audit log for a specific user
async function getUserAuditLogs(userId) {
    try {
        return await AuditLog
                        .find({userId})
                        .sort({timestamp: -1})
                        .populate('documentId', 'title filename')
                        .lean();
    }
    catch(err) {
        console.error('Error retrieving user audit logs: ',err);
        throw err;
    }
}

module.exports = {
    logDocumentAccess,
    getDocumentAuditLogs,
    getUserAuditLogs,
};