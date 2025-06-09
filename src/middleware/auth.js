const jwt = require('jsonwebtoken');

const auth = (req,res,next) => {
    try {
        //access x-auth-token from header
        const token = req.header('x-auth-token');

        //check if no token
        if(!token){
            return res.status(401).json({
                message: `No token! authorization denied`
            });
        }

        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //set user from the decoded token
        req.user = decoded.user;
        next();
    }
    catch(err){
        res.status(401).json({
            message: 'Token is not valid'
        });
    }

};

module.exports = auth;