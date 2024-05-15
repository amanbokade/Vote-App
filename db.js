const mongoose = require('mongoose');
require('dotenv').config();

const mongoURL = 'mongodb://localhost:27017/voting'
//const mongoURL = process.env.MONGODB_URL;
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;

db.on('connected', ()=>{
    console.log('Connected to MongoDb server');
});
db.on('error', (err)=>{
    console.log('Database connection Error');
});    
db.on('disconnected',() =>{
    console.log('Disconnected from the MongoDB Server');
});    

module.exports = db;