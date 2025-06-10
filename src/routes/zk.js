const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');
const auth = require('../middleware/auth');
const Document = require('../models/Document');
const {generateHash, verifyProof} = require('../utils/zkUtils');
const {logDocumentAccess} = require('../utils/auditUtils');



// POST /api/zk/verify - verify document using document ID
router.post('/verify', auth, upload.single('document'), async (req,res) => {
    try {
        if(!req.file) {
            return res.status(400).json({
                message: 'No document file provided'
            });
        }
        const {documentId} = req.body;

        if(!documentId) {
            return res.status(400).json({
                message: 'Document ID is required'
            });
        }

        //check if document ID is a valid Object ID format
        if(!documentId.match(/^[0-9a-fA-F]{24}$/)){
            return res.status(400).json({
                message: 'Invalid document ID format'
            });
        }

        //find the document
        const document = await Document.findById(documentId).exec();

        if(!document) {
            return res.status(404).json({
                message: 'Document not found'
            });
        }

        //check if user owns this document
        if(document.owner.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'Access denied. You can only verify your own documents.'
            });
        }

        //generate hash from uploaded document
        const uploadedHash = generateHash(req.file.buffer);

        //verify the document against the stored proof hash
        //stored hash is proof hash, so we can easily verify
        const isVerified = verifyProof(uploadedHash, document.hash);

        //log the verification attempt
        await logDocumentAccess({
            documentId: document._id,
            action: 'verify',
            userId: req.user.id,

            success: isVerified,
            details: {
                filename: document.filename,
                verificationResult: isVerified
            }
        });

        res.json({
            verified: isVerified,
            documentId: document._id,
            documentName: document.filename,
            timestamp: new Date(),
            message: isVerified ? 'Document verification successful' : 'Document verification failed'
        });
    }
    catch(err) {
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({
                message: 'Document not found'
            });
        }
        res.status(500).json({
            message: 'Server error'
        });
    }
});

module.exports = router;