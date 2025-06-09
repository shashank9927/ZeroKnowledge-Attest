require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

const app = express();

const connectdb = async() => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to database');
    }
    catch(err) {
        console.error('Database connection error ',err.message);
        process.exit(1);
    }
    
};

app.use(express.json());

app.listen(PORT, ()=>{
    console.log(`Server is running on PORT ${PORT} successfully`);
})