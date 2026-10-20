import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email : {
        type:String,
        required:[true,"Email is require"],
        trim:true,
        lowercase:true,
        unique:[true,"Email is already exist"]
    },
    name : {
        type:String,
        required:[true,"Name  is require"],
        
    },
    password : {
        type:String,
        required:[true,"Password is require"],
        minlength:[6,"Password should be greater than 6 charecter"]
    }

}
)
const Users = mongoose.model("Users",userSchema);

export default Users;