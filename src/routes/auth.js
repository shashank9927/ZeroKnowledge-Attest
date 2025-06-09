const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const {name, email, password} = req.body;

        // Check if user exists. To prevent duplicate entry
        let user = await User.findOne({email});
        if(user) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        // Create new user 
        user = new User({
            name,
            email,
            password
        });

        await user.save();

        return res.status(201).json({
            success: true,
            message: 'User registered successfully! Now login to access your account',
            user: {
                id: user.id,
                name: user.name,
                email: user.email 
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

// POST /api/auth/login
router.post('/login', async(req, res) => {
    try {
        const {email, password} = req.body;

        // Check if user exists
        let user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if(!isMatch) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }

        // Create JWT payload
        const payload = {
            user: {
                id: user.id
            }
        };

        // Sign token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn: '24h'},
            (err, token) => {
                if(err) {
                    throw err;
                }
                res.json({
                    token,
                    user: {id: user.id, name: user.name, email: user.email},
                    success: true,
                    message: 'Login successful! Welcome back'
                });
            }
        );
    }
    catch(err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Server error' 
        });
    }
});

module.exports = router;