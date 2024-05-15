const express = require( 'express');
const router = express.Router();
const User = require('../models/user');
const Candidate = require('../models/candidate');
const {jwtAuthMiddleware, generateToken} = require('../jwt');

const checkAdminRole = async(userId) => {
    try{
        const user = await User.findById(userId); 
        console.log("User:", user);
        if(user.role === 'admin'){
            return true;
        }
    }catch(err){
        return false;
    }
}

router.post('/',jwtAuthMiddleware, async (req, res) =>{
    try{

        if(!await checkAdminRole(req.user.id))
            return res.status(403).json({message: 'user dont have admin role'});
        

        const data = req.body;
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();
        console.log('data Saved');


        res.status(200).json({response: response});
    }
    catch(err){
        console.log(err);
        res.status(404).json({error:'Internal Server Error'});
    }
})

router.put('/:candidateID',jwtAuthMiddleware, async(req, res) =>{
    try{

        if(!checkAdminRole(req.user.id))
            return res.status(403).json({message: 'user dont have admin role'});

        const candidateID = req.params.candidateID;
        const updatedCandidateData = req.body;

        const response = await  person.findByIdAndUpdate(candidateID, updatedCandidateData,{
            new:true,
            runValidators: true,
        })

        if (!response){
            return res.status(403).json({error:"Candidate not Found"});
        }
        console.log('Candidate Data updated');
        res.status(200).json(response);
    
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'}); 
    }
})

router.delete('/:candidateID',jwtAuthMiddleware, async(req, res) =>{
    try{

        if(!checkAdminRole(req.user.id))
            return res.status(403).json({message: 'user dont have admin role'});

        const candidateID = req.params.candidateID;

        const response = await  person.findByIdAndDelete(candidateID)

        if (!response){
            return res.status(404).json({error:"Candidate not Found"});
        }
        console.log('Candidate Deleted');
        res.status(200).json(response);
    
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'}); 
    }
})

router.post('/vote/:candidateID', jwtAuthMiddleware, async(req, res) =>{
    
    const candidateID = req.params.candidateID;
    const userId = req.user.id;

    try{
        const candidate = await Candidate.findById(candidateID);
        const user = await User.findById(userId);
        if(!candidate){
            return res.status(404).json({message: 'Candidate not found'})
        }
        if(!user){
            return res.status(404).json({message: 'user not found'})
        }
        if(user.isVoted){
            return res.status(400).json({message: 'User has already voted'})
        }
        if(user.role === 'admin'){
            return res.status(403).json({message: 'Admin cannot vote'})
        }

        candidate.votes.push({user: userId})
        candidate.voteCount++;
        await candidate.save();

        user.isVoted = true
        await user.save();

        res.status(200).json({message: 'Vote recorded successfully'});
    
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});   
    }
});

router.get('/vote/count', async(req,res) => {
    try{
        const candidate = await Candidate.find().sort({voteCount: 'desc'});
        const voteRecord = candidate.map((data) => {
            return{
                party : data.party,
                count: data.voteCount
            }
        });
        
        return res.status(200).json(voteRecord)

    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});  
    }
})

module.exports = router;