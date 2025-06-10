// Common error response utilities
const handleMongoError = (error, res) => {
  console.error(error.message);
  if (error.kind === 'ObjectId') {
    return res.status(404).json({ msg: 'Document not found' });
  }
  res.status(500).json({ msg: 'Server error' });
};

const handleServerError = (error, res) => {
  console.error(error.message);
  res.status(500).json({ msg: 'Server error' });
};

const validateObjectId = (id) => {
  return id.match(/^[0-9a-fA-F]{24}$/);
};

const unauthorized = (res, message = 'Access denied') => {
  return res.status(403).json({ msg: message });
};

const notFound = (res, message = 'Not found') => {
  return res.status(404).json({ msg: message });
};

const badRequest = (res, message = 'Bad request') => {
  return res.status(400).json({ msg: message });
};

module.exports = {
  handleMongoError,
  handleServerError,
  validateObjectId,
  unauthorized,
  notFound,
  badRequest
};
