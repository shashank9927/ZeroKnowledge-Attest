const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const Document = require('../models/Document');
const {generateHash, generateProof} = require('../utils/zkUtils');
const {logDocumentAccess} = require('../utils/auditUtils');

//set up a temporary storage for document uploads
const storage = multer.memoryStorage();
const upload = multer({storage});

//POST /api/documents - Upload documents for attestation
router.post('/', auth, upload.single('document'), async(req, res) => {
    try {
        if(!req.file) {
            return res.status(400).json({
                message: 'No document file provided'
            });
        }

        const {title, description} = req.body;

        //generate hash from document content
        const hash = generateHash(req.file.buffer);

        //generate proof hash for zk verification
        const proofHash = generateProof(hash);

        //create document record with proof hash
        const document = new Document({
            title,
            description,
            hash: proofHash,
            filename: req.file.originalname,
            owner: req.user.id
        });

        await document.save();

        //log the document creation
        await logDocumentAccess({
            documentId: document._id,
            action: 'create',
            userId: req.user.id,
            
            success: true,
            details: {
                filename: document.filename,
                title: document.title
            }
        });

        res.status(201).json({
            document: {
                id: document.id,
                title: document.title,
                description: document.description,
                filename: document.filename,
                createdAt: document.createdAt
            }
        });
    }    
    catch(err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Server error'
        });
    }
});


//GET /api/documents - Get user documents
router.get('/', auth, async(req, res) => {
    try {
        const documents = await Document.find({owner: req.user.id})
                                        .select('-hash') //dont send hash in response
                                        .sort({createdAt : -1});
        res.json(documents);
                                                    
    }
    catch(err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Server error'
        });
    }
});

// GET /api/documents/:id - Get specific document details
router.get('/:id', auth, async(req, res) => {
    try {
        const document = await Document.findById(req.params.id).exec();

        if(!document) {
            return res.status(404).json({
                message: 'Document not found'
            });
        }

        //check document ownership
        if(document.owner.toString() !== req.user.id) {
            //log unauthorized attempt
            await logDocumentAccess({
                documentId: document._id,
                action: 'view',
                userId: req.user.id,

                success: false,
                details: {
                    reason: 'Unauthorized access attempt'
                }
            });

            return res.status(403).json({
                message: 'Not authorized to access this document'
            });
        }

        //log successful document view
        await logDocumentAccess({
            documentId: document._id,
            action: 'view',
            userId: req.user.id,
            
            success: true
        });

        res.json({
            id: document.id,
            title: document.title,
            description: document.description,
            filename: document.filename,
            createdAt: document.createdAt,
            hashPreview: document.hash.substring(0,10) + '...' + document.hash.substring(document.hash.length - 10)
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
            'message': 'Server error'
        });
    }
});


//PUT /api/documents/:id - update document metadata
router.put('/:id', auth, async(req, res) => {
    try {
        const {title, description} = req.body;

        const document = await Document.findById(req.params.id).exec();

        if(!document) {
            return res.status(404).json({
                message: 'Document not found'
            });
        }

        //check document ownership
        if(document.owner.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'Not authorized to update this document'
            });
        }

        //update only allowed field
        if(title) {
            document.title = title;
        }

        if(description) {
            document.description = description;
        }

        await document.save();

        //log document update
        await logDocumentAccess({
            documentId: document._id,
            action: 'update',
            userId: req.user.id,

            success: true,
            details: {
                title: title ? title : undefined,
                description: description ? description : undefined
            }
        });

        res.json({
            document: {
                id: document.id,
                title: document.title,
                description: document.description,
                createdAt: document.createdAt
            }
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

//DELETE /api/documents/:id - DELETE a document
router.delete('/:id', auth, async(req, res) => {
    try {
        const document = await Document.findById(req.params.id).exec();

        if(!document) {
            return res.status(404).json({
                message: 'Document not found'
            });
        }

        //check document ownership
        if(document.owner.toString() !== req.user.id) {
            //log unauthorized delete attempt
            await logDocumentAccess({
                documentId: document._id,
                action: 'delete',
                userId: req.user.id,

                success: false,
                details: {
                    reason: 'Unauthorized delete attempt'
                }
            });

            return res.status(403).json({
                message: 'Not authorized to delete this document'
            });
        }

        //log document deletion before deleting it
        await logDocumentAccess({
            documentId: document._id,
            action: 'delete',
            userId: req.user.id,

            success: true,
            details: {
                title: document.title,
                filename: document.filename 
            }
        });

        await Document.findByIdAndDelete(req.params.id).exec();
        res.json({
            message: 'Document removed'
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

module.exports = router;