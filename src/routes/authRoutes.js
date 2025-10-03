import express from "express"
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken=(userId)=>{
return jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"15d"})
}

router.post("/register",async(req,res)=>{
   try {
      const {username,email,password}= req.body;

      if(!username||!email||!password){
         return res.status(400).json({message:"All fields are required"});
      }

      if(password.length<6){
         return res.status(400).json({message:"Password should be at least 6 characters long"});
      }
      if(username<3){
         return res.status(400).json({message:"Username should be at least 3 characters long"});
      }

      const existingEmail=await User.findOne({email});
      if(existingEmail){
        return res.status(400).json({message:"Email already exists"}); 
      }
      const existingUserName=await User.findOne({username});
      if( existingUserName){
         return res.status(400).json({message:"Username already exists"});
      }

      const profileImage=`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
      const user= new User({
         email,username,password,profileImage,
      });

      await user.save();

      const token=generateToken(user._id);
      res.status(201).json({token,user:{
         _id:user._id,
         username:user.username,
         email:user.email,
         profileImage:user.profileImage
      }});
   } catch (error) {
      console.log("Error in register route",error);
      res.status(500).json({message:"Internal Server Error"});
   } 
})

router.post("/login",async(req,res)=>{
   try {
       const {email,password}= req.body;

       if(!email||!password){
         return res.status(400).json({message:"All fields are required"});
       }

       const user=await User.findOne({email});
       if(!user){
         return res.status(400).json({message:"Invalid Credentials"});
       }

       const isPasswordCorrect=await user.comparePassword(password);
       if(!isPasswordCorrect)return res.status(400).json({message:"Invalid Credentials"});

       const token=generateToken(user._id);
      res.status(201).json({token,user:{
         _id:user._id,
         username:user.username,
         email:user.email,
         profileImage:user.profileImage
      }});

   } catch (error) {
       console.log("Error in register route",error);
      res.status(500).json({message:"Internal Server Error"});
   }
})


export default router;
