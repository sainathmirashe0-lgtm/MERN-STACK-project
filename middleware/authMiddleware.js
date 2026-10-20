import Users from "../models/Student.js";
import jwt from "jsonwebtoken";
const JWT_SECRET = "uk85UaRcKPa7z38pWqAmJSnAGvZ";
async function  authMiddleware(req,res,next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token) {
        return res.status(401).json({
            message: "Unauthorized access,token is missing"
        })
    }
    try{
    const decode = jwt.verify(token,JWT_SECRET)
    const user = await  Users.findById(decode.userId)
    req.user = user;
    return next();
    } catch(err)
 {
    return res.status(401).json({
        message: "Unauthirized access,tokan is invalid"
    })
}
}
export default authMiddleware;