import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login(){
    const[username,setUsername]=useState("");
    const[password,setPassword]=useState("");
    const navigate=useNavigate();

    async function handleLogin(e){
        e.preventDefault();
        const res=await fetch("http://127.0.0.1:8000/api/token/",{
            method: "POST",
            headers:{
               "Content-Type":"application/json", 
            },
            body:JSON.stringify({username,password}),
        });
        const data=await res.json();

        if(res.ok){
            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh",data.refresh);
            navigate("/domains");
        }
        else{
            alert("Invalid Credentials");
        }
    }
      return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-80"
      >
        <h2 className="text-xl font-bold mb-4">Login</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full mb-3 p-2 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );


}