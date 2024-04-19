

const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require('cors');

app.use(express.json());
app.use(cors());

// DataBase Connetion with Mongodb
mongoose.connect('mongodb://localhost:27017/RegForm');

// API Creation
app.get('/',(req,res)=>{
      res.send("Express App Is Running");
})

// Schema for Crating Users
const Users = mongoose.model("Users",{
    username : {
        type : String,
    },
    email : {
        type : String,
        unique : true,
    },
    password : {
        type : String
    },
    date : {
        type : Date,
        default : Date.now,
    }
})

// Creating Endpoint for registering User
app.post('/signup',async(req,res)=>{
       let check = await Users.findOne({email:req.body.email});
       if(check){
            return res.status(400).json({success: false, error : "Existing User Found"})
       }
       const user = new Users({
         username : req.body.username,
         email : req.body.email,
         password : req.body.password
       })

       await user.save();

       const data = {
         user: {
            id : user.id,
            name : user.username
         }
       }

       const token = jwt.sign(data, "secret_user");
       res.json({success : true, token})
})

// Creating End point for user Login
app.post('/login', async(req,res)=>{
    let user = await Users.findOne({email:req.body.email});
    if(user){
        const passCompare = req.body.password === user.password;
        if(passCompare){
            const data = {
                user : {
                    id : user.id,
                    name : user.username
                }
            }
            const token = jwt.sign(data, 'secret_user')
            res.json({success : true, token});
        }else{
            res.json({success:false, error: "Wrong Password"});
        }
    }else{
        res.json({success:false, errors: "Wrong Email Id"});
    }
})

app.listen(port, (error)=>{
    if(!error){
        console.log("Server Running on Port "+ port);
    }else{
        console.log("Error : "+error);
    }
})