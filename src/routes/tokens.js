const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Document = require('../models/Document');
const VerificationToken = require('../models/VerificationToken');
const { logDocumentAccess } = require('../utils/auditUtils');

// POST /api/tokens - Generate new verification token for a document
router.post('/', auth, async(req, res) => {
    try {
        const {documentId, usageLimit} = req.body;

        if(!documentId) {
            return res.status(400).json({
                message: 'Document ID is required'
            });
        }

        //check if the documentId is a valid ObjectId format
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
                message: 'Access denied. You can only generate tokens for your documents'
            });
        }

        //set usage limit if provided
        let tokenUsageLimit = 5; // default usage limit is 5
        if(usageLimit && Number.isInteger(Number(usageLimit)) && Number(usageLimit) > 0) {
            tokenUsageLimit = Number(usageLimit);
        }

        //generate token
        const token = new VerificationToken({
            document: documentId,
            token: VerificationToken.generateTokenString(),
            createdBy: req.user.id,
            usageLimit: tokenUsageLimit
        });

        await token.save();

        //log token generation
        await logDocumentAccess({
            documentId: document._id,
            action: 'generate_token',
            userId: req.user.id,
            
            success: true,
            details: {
                tokenId: token._id,
                usageLimit: token.usageLimit 
            }
        });

        res.status(201).json({
            token: token.token,
            id: token._id,
            usageLimit: token.usageLimit,
            usageCount: token.usageCount,
            message: 'Verification token generated successfully'
        });
    }
    catch(err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Server error'
        });
    }
});

//GET /api/tokens - Get all tokens from user's document
router.get('/', auth, async(req,res)=>{
    try {
        //get all documents owned by user
        const userDocuments = await Document.find({owner: req.user.id}).select('_id'); // Fixed: req.user.id instead of req.user._id
        const documentIds = userDocuments.map(doc => doc._id);

        //get all tokens for these documents
        const tokens = await VerificationToken.find({document: {$in: documentIds}})
                                              .sort({createdAt: -1})
                                              .populate('document', 'title filename');
        
        const formattedTokens = tokens.map(token => ({
            id: token._id,
            token: token.token,
            document: token.document._id,
            documentTitle: token.document.title,
            usageLimit: token.usageLimit,
            usageCount: token.usageCount,
            isValid: token.isValid()
        }));

        res.json(formattedTokens);
    }
    catch(err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Server error'
        });
    }
});

// GET /api/tokens/:documentId - Get all tokens for a specific document
router.get('/:documentId', auth, async(req,res) => {
    try {
        const {documentId} = req.params;

         //check if the documentId is a valid ObjectId format
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
                message: 'Access denied. You can only view tokens for your documents'
            });
        }

        //get all tokens for this document
        const tokens = await VerificationToken.find({document: documentId}).sort({createdAt: -1});

        const formattedTokens = tokens.map(token => ({
            id: token._id,
            token: token.token,
            usageLimit: token.usageLimit,
            usageCount: token.usageCount,
            isValid: token.isValid(),
            isExhausted: token.isExhausted(),
            createdAt: token.createdAt
        }));

        res.json(formattedTokens);
    }
    catch(err) {
        console.error(err.message);
        if(err.kind === 'ObjectId'){ // Fixed: err instead of error
            return res.status(404).json({
                message: 'Document not found'
            });
        }

        res.status(500).json({
            message: 'Server error' // Fixed: capitalized "Server"
        });
    }
});

// DELETE /api/tokens/:id - Delete a token
router.delete('/:id', auth, async(req,res) => {
    try {
        const token = await VerificationToken.findById(req.params.id).populate('document', 'owner');

        if(!token) {
            return res.status(404).json({
                message: 'Token not found'
            });
        }

        //check if the user owns this document
        if(token.document.owner.toString() !== req.user.id) { // Fixed: token.document.owner instead of document.owner
            return res.status(403).json({
                message: 'Access denied. You can only delete tokens for your documents'
            });
        }

        await VerificationToken.findByIdAndDelete(req.params.id);

        //log token deletion
        await logDocumentAccess({
            documentId: token.document._id,
            action: 'delete_token',
            userId: req.user.id,

            success: true,
            details: {
                tokenId: token._id
            }
        });

        res.json({
            message: 'Token removed'
        });
    }
    catch(err) {
        console.error(err.message);

        if(err.kind === 'ObjectId') {
            return res.status(404).json({
                message: 'Token not found'
            });
        }

        res.status(500).json({
            message: 'Server error'
        });
    }
});

module.exports = router;