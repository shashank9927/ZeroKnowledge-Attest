const crypto = require('crypto');

//generate document hash
const generateHash = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
};

//generate Zero Knowledge Proof
const generateProof = (hash, secretKey = process.env.ZK_SECRET) => {
    return crypto.createHmac('sha256', secretKey).update(hash).digest('hex');
};

//verify proof
const verifyProof = (hash, proof, secretKey = process.env.ZK_SECRET) => {
    const newProof = crypto.createHmac('sha256', secretKey).update(hash).digest('hex');
    return newProof === proof;
};

module.exports = {
    generateHash,
    generateProof,
    verifyProof
}


