require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;
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

connectdb().catch(err => {
  console.error('Failed to connect to MongoDB', err);
  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI is set' : 'URI is not set');
});

app.use(express.json());

//define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/zk', require('./routes/zk'));
app.use('/api/public', require('./routes/public'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/tokens', require('./routes/tokens'));

//home route
app.get('/', (req,res) =>{
    res.send('Welcome to ZeroKnowledge Attestor API');
});

// error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Server error',
        error: err.message
    });
});




app.listen(PORT, ()=>{
    console.log(`Server is running on PORT ${PORT} successfully`);
});