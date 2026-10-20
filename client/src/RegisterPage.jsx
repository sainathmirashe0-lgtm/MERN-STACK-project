import { useState } from "react";
import "./App.css";
import { Link } from 'react-router-dom';

function Register() {
const[email,setEmail] = useState("");
const[name,setname] = useState("");
const[password,setPassword] = useState("");
const[msg,setMsg] = useState("");
const[loding,setLoding] = useState(false);
async function handle(e) {
     e.preventDefault();
     setLoding(true);
     setMsg("");
     try{
        const respose = await fetch("http://localhost:3000/api/auth/register",{
          method : "POST",
          headers : {
            "Content-type":"application/json",
          },
          body : JSON.stringify({email,name,password}),
        });
        const contentType = respose.headers.get("content-type") || "";
        const data = contentType.includes("application/json") ? await respose.json() : await respose.text();
        if(!respose.ok){
            setMsg(typeof data === "string"?data :data.message || "registeration fail")
            return
        }
        setMsg(`your Welcome ${data.user.name}! Registeration successful`);

     } catch(error) {
        setMsg("backend is not connect properly")
     }
     finally {
        setLoding(false)
     }
}
  return (
      <div className="login-container">
        <form className="login-card" onSubmit={handle}>
         <h1>Register Page</h1>
         <label htmlFor="email">Email</label>
         <input id="email" type="email" placeholder="Enter your Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
         <label htmlFor="name">Name</label>
         <input id="name" type="text" placeholder="Enter your Name" value={name} onChange={(e)=>setname(e.target.value)} />
         <label htmlFor="password">Password</label>
         <input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e)=>setPassword(e.target.value)} />
         <Link to="/"> User Already exist?</Link>
         <button type="submit" disabled={loding}>{loding ? "Registering..." : "Register"}</button>
         {msg && <p className="message">{msg}</p>}
        </form>
    </div>
  )
}

export default Register
