import mongoose from "mongoose";

function connectionDB() {
    mongoose.connect("mongodb://localhost:27017/myDatabase?retryWrites=false")
    .then(()=>{
        console.log("datbase is connect to server")
    })
    .catch(err=>{
        console.log("error occured");
         process.exit(1);
    })
}
export default connectionDB;