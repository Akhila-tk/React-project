import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
   
    e.preventDefault();
    setLoading(true);
     const BASE_URL = import.meta.env.VITE_REACT_APP_BASE_URL;


    try {
      const formBody = new URLSearchParams();
      formBody.append("username", formData.username);
      formBody.append("password", formData.password);

      const response = await fetch(`${BASE_URL}login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody.toString(),
      });

      const data = await response.json();

      if (response.ok) {
        //  Store access token securely in cookies
        Cookies.set("access_token", data.access_token, {
          expires: 1, // 1 day
          secure: true, 
          sameSite: "strict",
        });

        //  Store admin_id in cookies 
        Cookies.set("admin_id", data.admin_id, {
          expires: 1, // Match access token expiry
          secure: true,
          sameSite: "strict",
        });

        // Store username in sessionStorage 
        sessionStorage.setItem("username", data.username);

        //  Store token expiry time in cookies
        const expiryTime = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hours
        Cookies.set("token_expiry", expiryTime, { expires: 1 });

     
      
          navigate("/dashboard");
     
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.detail || "Invalid credentials!",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-xl p-8 w-96">
        <div className="text-center mb-4">
          <div className="text-4xl">👤</div>
          <h2 className="text-2xl font-bold">Admin Login</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center mt-4">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 font-semibold">
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
