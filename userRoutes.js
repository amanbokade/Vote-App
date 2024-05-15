const express = require( 'express' );
const router = express.Router();
const User = require('../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');
//const { use } = require('passport');

router.post('/signup', async (req, res) =>{
    try{
        const data = req.body
        const newUser = new User(data);
        const response = await newUser.save();
        console.log('data Saved');

        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is :", token);

        res.status(200).json({response: response, token: token});

    }
    catch(err){
        console.log(err);
        res.status(404).json({error:'Internal Server Error'});
    }
})

router.post('/login', async(req, res) =>{
    try{
        const {aadharCardNumber, password} = req.body;

        const user = await User.findOne({aadharCardNumber: aadharCardNumber});

        if( !user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid username or password'});   
        }
        const payload = {
            id : user.id,
        }
        const token = generateToken(payload);

        res.json({token})
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }  

})
router.get('/profile', async(req, res) =>{
    try{
        const userData = req.user;
        const userId = userData.Id;
        const user = await User.findById(userId);
        res.status(200).json(user);
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});   
    }
})

router.put('/profile/password', jwtAuthMiddleware, async(req, res) =>{
    try{
        const userId = req.user.id;
        const {currentPassword, newPassword} = req.body;
        const user = await user.findById(userId);

        if(!(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid username or password'});   
        }

        user.password = newPassword;
        await user.save();

        
        console.log('Password Updated!!');
        res.status(200).json({'message':'Password updated successfully!'}); 
    
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'}); 
    }
})

module.exports = router;