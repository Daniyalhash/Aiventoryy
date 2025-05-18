import '@/styles/SignupPage.css';
import { useState } from "react";
import { Eye, EyeOff } from 'lucide-react';

const UserCredentials = ({ onApproved }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    shopname: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    username: "",
    shopname: "",
  });

  const [inputValid, setInputValid] = useState({
    email: null,
    password: null,
    username: null,
    shopname: null,
  });

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      setInputValid({ ...inputValid, email: value.includes("@") });
    } else if (name === "password") {
      setInputValid({ ...inputValid, password: value.length >= 6 });
    } else if (name === "username") {
      setInputValid({ ...inputValid, username: value.trim() !== "" });
    } else if (name === "shopname") {
      setInputValid({ ...inputValid, shopname: value.trim() !== "" });
    }
    
  };
  console.log(formData)
  const clearError = (field) => {
    setTimeout(() => {
      setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));
    }, 3000);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.includes("@")) {
      newErrors.email = "Please enter a valid email address.";
      clearError("email");
    }
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
      clearError("password");
    }
    if (formData.shopname.trim() === "") {
      newErrors.shopname = "Shop name is required.";
      clearError("shopname");
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/aiventory/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Signup successful! Redirecting...");
        setIsError(false);
        
        setFormData({
          username: "",
          email: "",
          password: "",
          shopname: "",
        });

        setTimeout(() => {
          onApproved({ user_id: data.user_id, email :formData.email});
          // setMessage(""); // Clear message before redirect
        }, 1000);

      } else {
        setIsError(true);
        if (data.error) {
          setMessage(data.error);
        } else if (data.email) {
          setMessage(data.email[0]);
          setErrors({ email: data.email[0] });
        } else if (data.password) {
          setMessage(data.password[0]);
          setErrors({ password: data.password[0] });
        } else {
          setMessage("Something went wrong during signup.");
        }
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
      setIsError(true);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="userCredentials">
      <div className="SignText">
        <h1 className="welcometext">Create your account</h1>
        <p className="subtext">Let's get started</p>
      </div>

      {/* Message Container - Same as Login Page */}
      <div className={`messageContainer ${message ? 'show' : ''} ${isError ? 'error' : 'success'}`}>
        <div className="message-content">
          <span className="close-icon" onClick={() => setMessage("")}>✖</span>
          {message}
        </div>
      </div>

      <form className="form2" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Full Name"
          required
          value={formData.username}
          onChange={handleChange}
          className={`inputfield2 ${inputValid.username === true ? 'valid-input' : inputValid.username === false ? 'invalid-input' : ''}`}
        />
           <input
          type="text"
          name="shopname"
          placeholder="Shop Name"
          required
          value={formData.shopname}
          onChange={handleChange}
          className={`inputfield2 ${inputValid.shopname === true ? 'valid-input' : inputValid.shopname === false ? 'invalid-input' : ''}`}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleChange}
          className={`inputfield2 ${inputValid.email === true ? 'valid-input' : inputValid.email === false ? 'invalid-input' : ''}`}
        />
        {errors.email && <p className="error-text">{errors.email}</p>}

        <div className="input-row">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
            className={`inputfield2 ${inputValid.password === true ? 'valid-input' : inputValid.password === false ? 'invalid-input' : ''}`}
          />
          <span onClick={togglePasswordVisibility} className="absolute">
            {showPassword ? <Eye size={20} color="#004b23" /> : <EyeOff size={20} color="#004b23" />}
          </span>
        </div>
        {errors.password && <p className="error-text">{errors.password}</p>}

        <div className="checkbox-container">
          <input type="checkbox" id="terms" className='checkbox' required />
          <label htmlFor="terms" className='terms'>I agree to the terms and conditions</label>
        </div>

        <button
  type="submit"
  className="iconButton"
  disabled={
    !inputValid.email || 
    !inputValid.password || 
    !inputValid.username || 
    !inputValid.shopname
  }
>
  Sign Up
</button>


        <p className="login-text">
          Already have an account? <a href="/login" className='login-text-link'>Login</a>
        </p>
      </form>
    </div>
  );
};

export default UserCredentials;