import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import content from "../content";
import "./login.css"; 

// IMPORT ICON PROFESIONAL
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";

// IMPORT GAMBAR DARI ASSETS
import logoImg from "../assets/logo.png";
import illuImg from "../assets/illustration-login.png";

function Login({ setUser, language }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const text = content[language].login;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setStatusMsg({ type: 'error', text: language === "ID" ? "Isi semua field!" : "Fill all fields!" });
      return;
    }

    setStatusMsg({ type: '', text: '' }); // Clear any previous messages

    try {
      const response = await authService.login({ email, password });
      
      if (response.success && response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("isLoggedIn", "true");
        
        try {
          const userData = await authService.getMe();
          if (userData && userData.data && userData.data.user) {
            localStorage.setItem("user", JSON.stringify(userData.data.user));
            setUser(userData.data.user);
          }
        } catch(meErr) {
          console.error("Failed to fetch user data", meErr);
        }
        
        navigate("/home");
      }
    } catch (error) {
      console.error("Login Error:", error);
      // EXTRACTION: Priority on backend message
      const apiMessage = error.response?.data?.message || (language === "ID" ? "Email atau password salah!" : "Invalid email or password!");
      setStatusMsg({ type: 'error', text: apiMessage });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-left">
          <div className="auth-logo">
            <img src={logoImg} alt="VeriHire" />
          </div>
          
          <h2>{text.title}</h2>
          
          {statusMsg.text && (
            <div className={`auth-status-msg ${statusMsg.type}`}>
               {statusMsg.text}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="auth-group">
              <label>Email</label>
              <div className="input-with-icon">
                <FiMail className="input-icon-v" />
                <input 
                  type="email" 
                  placeholder={text.email} 
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="auth-group">
              <div className="label-row">
                <label>{language === "ID" ? "Kata Sandi" : "Password"}</label>
                {/* FIX: Pakai Link asli ke halaman forgot-password */}
                <Link to="/forgot-password" style={{ color: "#4f46e5", textDecoration: "none", fontSize: "0.8rem", fontWeight: "600" }}>
                  {language === "ID" ? "Lupa Password?" : "Forgot Password?"}
                </Link>
              </div>
              <div className="input-with-icon">
                <FiLock className="input-icon-v" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder={text.password} 
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button" 
                  className="eye-icon-v" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-auth-primary">{text.button}</button>
          </form>

          <p className="auth-footer">
            {text.noAccount} <Link to="/register">{text.register}</Link>
          </p>
        </div>

        <div className="auth-right">
          <img src={illuImg} alt="Illustration" />
        </div>
      </div>
    </div>
  );
}

export default Login;