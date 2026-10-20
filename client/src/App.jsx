
import { useState } from 'react'
import './App.css';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

function App() {
  const[email,setEmail] = useState('');
  const[password,setPassword] = useState('');
  const[msg,setMsg] = useState('');
  const[loding,setLoding] = useState(false);
  const navigate = useNavigate();

async function handle(e){
  e.preventDefault();
  setLoding(true);
  setMsg('');

  try {
  const response = await fetch("http://localhost:3000/api/auth",{
    method : "POST",
  headers : {
  'Content-type' : 'application/json',
  },
  body:JSON.stringify({email,password}),
  });
  const contentType = response.headers.get('content-type') || "";
  const data  = contentType.includes('application/json')
  ? await response.json()
  : await response.text()
  
  if(!response.ok) {
    setMsg(
      typeof data === "string" ? data : data.message || 'Login failed'
    )
    return
  }
  setMsg(`your Welcome ${data.user.name}! Login successful`);
  
  localStorage.setItem("token", data.token);
  navigate("/dashboard");

}  catch(error) {
  setMsg("backend connection isssue");
}
finally {
  setLoding(false);
}

}
return (
  <div className="login-container">
     <form className="login-card" onSubmit={handle}>
      <h1> Banking System</h1>
       <p className="subtitle">Loging</p>
         <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
          <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Link to="./register">New User? Click here!</Link>
        <button type='submit' disabled={loding}>{loding ?"Loging...":"Login"}</button>
         {msg && <p className="message">{msg}</p>}
     </form>
    </div>
)
}
export default App;
