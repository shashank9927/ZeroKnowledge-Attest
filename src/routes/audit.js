const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Document = require('../models/Document');
const {getDocumentAuditLogs, getUserAuditLogs} = require('../utils/auditUtils');

// GET /api/audit/documents/:id - Get audit logs for a specific document
router.get('/documents/:id', auth, async(req,res) => {
    try{
        const document = await Document.findById(req.params.id).exec();

        if(!document) {
            return res.status(404).json({
                message: 'Document not found'
            });
        }

        //check document ownership
        if(document.owner.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'Not authorized to access audit log for this document'
            });
        }

        //get all audit logs for this document
        const logs = await getDocumentAuditLogs(req.params.id);
        res.json({
            auditLogs: logs,
            total: logs.length
        });
    }

    catch(err) {
        console.error(err.message);
        if(err.kind === 'ObjectId') {
            return res.status(404).json({
                message: 'Document not found'
            });
        }
        res.status(500).json({
            message: 'server error'
        });
    }
});

// GET /api/audit/me - Get audit logs for the current user's activity
router.get('/me', auth, async (req,res) => {
    try{
        const logs = await getUserAuditLogs(req.user.id);

        res.json({
            auditLogs: logs,
            total: logs.length
        });
    }
    catch(err) {
        console.error(err.message);
        res.status(500).json({
            message: 'server error'
        });
    }
});

module.exports = router;