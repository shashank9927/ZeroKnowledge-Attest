const multer = require('multer');

// Set up temporary storage for document uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
