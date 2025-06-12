const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');
const Document = require('../models/Document');
const VerificationToken = require('../models/VerificationToken');
const {logDocumentAccess} = require('../utils/auditUtils');
const {generateHash, verifyProof} = require('../utils/zkUtils');


// POST /api/public/verify - Public document verification route (only token is required)
router.post('/verify', upload.single('document'), async(req,res) => {
    try{
        if(!req.file) {
            return res.status(400).json({
                message: 'No document file provided'
            });
        }

        const {verificationToken} = req.body;

        if(!verificationToken){
            return res.status(400).json({
                message: 'Verification token required'
            });
        }

        //find and validate the verification token
        const token = await VerificationToken.findOne({token: verificationToken}).exec();

        if(!token) {
            return res.status(401).json({
                message: 'Invalid verification token'
            });
        }

        if(!token.isValid()) {
            return res.status(401).json({
                message: 'Verification token has been exhausted (usage limit exceeded)',
                exhausted: token.isExhausted(),
                usageCount: token.usageCount,
                usageLimit: token.usageLimit
            });
        }

        //find the document from the token
        const document = await Document.findById(token.document).exec();

        if(!document) {
            return res.status(404).json({
                message: 'Document not found'
            });
        }

        //generate hash from the uploaded document
        const uploadedHash = generateHash(req.file.buffer)

        //verify document against the stored proof hash
        const isVerified = verifyProof(uploadedHash, document.hash);

        //increment token usage count after verification attempt
        await token.incrementUsage();

        //log verification attempt
        await logDocumentAccess({
            documentId: document._id,
            action: 'verify_public',
            success: isVerified,
            details: {
                filename: document.filename,
                verificationResult: isVerified,
                tokenId: token._id,
                usageCount: token.usageCount,
                usageLimit: token.usageLimit
            }
        });

        //return verification result
        res.json({
            verified: isVerified,
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