import Users from "../models/Student.js";
import jwt from "jsonwebtoken";
const JWT_SECRET = "uk85UaRcKPa7z38pWqAmJSnAGvZ";
async function registration(req,res) {
    const{ email,name,password } = req.body;
    const isExist = await Users.findOne({
        email:email
    });

    if(isExist) {
        return res.status(422).json({ message: "Email is already exist", status:"failed"})
    }
    const user = await Users.create({
        email,password,name
    })
 const token = jwt.sign({userId:user._id},JWT_SECRET,{
    expiresIn:"3d"
 })
 res.cookie("token",token)

 res.status(201).json({
   user: {
    _id:user.id,
    email: user.email,
    name: user.name
   },
    token
 })
}
async function login(req,res) {
    const{ email,password } = req.body;


    const isExist = await Users.findOne({
        email:email
    });

  
   
if(!isExist) {
        return res.status(404).json({ message: "account is not found", status:"failed"})
    }
    

    if(isExist.password !== password) {
        return res.status(422).json({ message: "invalid password", status:"failed"})
    }

     
     const token  = jwt.sign({userId:isExist._id},JWT_SECRET,{
    expiresIn:"3d"
 })   
 res.cookie("token",token)

 res.status(200).json({
   user: {
    _id:isExist.id,
    email: isExist.email,
    name: isExist.name
   },
    token
 })
}

export default { registration,login };