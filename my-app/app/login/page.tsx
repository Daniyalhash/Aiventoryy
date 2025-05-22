'use client';

import Link from "next/link";
import { useState, useEffect } from "react";

import Image from 'next/image';

import "@/styles/LoginPage.css";
import { useUser } from "@/components/UserContext"; // adjust the path as needed
interface LoginResponse {
  token: string;
  userId: string;
  status: string;
  username?: string;
  error?: string;
}

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // Can be error or success
  const [isError, setIsError] = useState(false); // To differentiate between error and success
  const { setUser } = useUser();

  // Run once when page loads or React component mounts


  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (token && userId) {
        window.location.href = "/dashboard";
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setIsError(false);

    if (!email || !password) {
      setMessage("Please enter both email and password.");
      setIsError(true);

      setTimeout(() => {
        setMessage("");
        setIsError(false);
      }, 3000);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/aiventory/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      if (response.ok) {
        const { token, userId, status } = data;

        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);
        localStorage.setItem("username", data.username || "");
        localStorage.setItem("loginTime", Date.now().toString());
        sessionStorage.setItem("justSignedUp", "true");
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data); // not user



        if (status === "incomplete") {
          setMessage("Your profile is incomplete. Please upload your dataset to proceed.");
          setIsError(true);
          setTimeout(() => {
            window.location.href = `/signup?step=2&userId=${userId}&email=${encodeURIComponent(email)}`;
          }, 800);
          return;
        }

        // ✅ Show success message before redirect
        setMessage("Login successful!");
        setIsError(false);

        // ✅ Trigger stock check (non-blocking)
        fetch(`http://127.0.0.1:8000/aiventory/check_stock_levels/?user_id=${userId}`)
          .then((res) => res.json())
          .then((stockData) => {
            if (!stockData.ok) {
              console.error("Stock check failed:", stockData.error);
            }
          })
          .catch((err) => console.error("Stock check error:", err));
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        setIsError(true);
        if (data.error === "User does not exist!") {
          setMessage("We couldn't find an account with that email.");
        } else if (data.error === "Invalid password!") {
          setMessage("The password you entered is incorrect.");
        } else {
          setMessage("Unable to log in. Please try again.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Something went wrong. Please try again.");
      setIsError(true);
    }
  };


  return (
    <div className="loginContainer">
      <div className="loginLeft">
        <div className="logocontainer">
          <div className="logo">
   <Image
              src="/images/logoPro.png"
              alt="Logo"
              width={100}
              height={100}
              className="logImg"
              hidden
            />          </div>
        </div>
        <div className="loginText">
          <h1 className="welcometext">Welcome back!</h1>
          <p className="subtext">Log in to access your dashboard</p>
        </div>

        <form className="loginform">
          <input
            type="email"
            placeholder="Email Address"
            className="inputfield"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="inputfield"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="loginbutton" onClick={handleLogin}>
            Log In
          </button>
          <p className="login-text">
           Don&apos;t have an account? <a href="/signup" className="login-text-link">Sign up</a>
          </p>
        </form>

        {/* Success/Error Message */}
        <div className={`messageContainer ${message ? 'show' : 'hide'} ${isError ? 'error' : 'success'}`}>
          <div className="message-content">
            <span className="close-icon" onClick={() => setMessage("")}>✖</span>
            {message}
          </div>
        </div>

        <div className="reset-password-container">
          <Link href="/forgot" className="reset-password-link">
            <p className="reset-message">Forgot Password?</p>
          </Link>
        </div>
    
      </div>

      <div className="loginright ">
        <div className="logoRight">
          <Link href="/">
            <Image
              src="/images/logoPro2.png"
              alt="Logo"
              className="logImg"
              width={100}
              height={100}
              style={{ height: "auto", cursor: "pointer" }}
            />
          </Link>
        </div>

        <video
          className="animatedVideo"
          autoPlay
          loop
          muted
          playsInline
          src="/video/vid2.mp4"
          type="video/mp4"
        ></video>
      </div>
    </div>
  );
};

export default LoginPage;
