import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import "./register.css";

// IMPORT ICON
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser } from "react-icons/fi";

// IMPORT GAMBAR DARI ASSETS
import logoImg from "../assets/logo.png";
import illuImg from "../assets/illustration-login.png";

function Register({ language }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setStatusMsg({ type: 'error', text: language === "ID" ? "Isi semua field!" : "Fill all fields!" });
      return;
    }
    if (password !== confirmPassword) {
      setStatusMsg({ type: 'error', text: language === "ID" ? "Password tidak sama!" : "Passwords do not match!" });
      return;
    }

    setStatusMsg({ type: '', text: '' });

    try {
      const response = await authService.register({ 
        username, 
        email, 
        password 
      });

      if (response.success) {
        setStatusMsg({ type: 'success', text: language === "ID" ? "Berhasil daftar! Silakan masuk." : "Registration successful! Please login." });
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      console.error("Register Error:", error);
      const apiMessage = error.response?.data?.message || (language === "ID" ? "Terjadi kesalahan pendaftaran!" : "Registration failed!");
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
          
          <h2>{language === "ID" ? "Daftar Akun" : "Create Account"}</h2>
          
          {statusMsg.text && (
            <div className={`auth-status-msg ${statusMsg.type}`}>
               {statusMsg.text}
            </div>
          )}
          
          <form onSubmit={handleRegister}>
            <div className="auth-group">
              <label>Username</label>
              <div className="input-with-icon">
                <FiUser className="input-icon-v" />
                <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
              </div>
            </div>

            <div className="auth-group">
              <label>Email</label>
              <div className="input-with-icon">
                <FiMail className="input-icon-v" />
                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="auth-group">
              <label>Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon-v" />
                <input 
                  type={showPass ? "text" : "password"} 
                  placeholder="Password" 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button type="button" className="eye-icon-v" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="auth-group">
              <label>{language === "ID" ? "Konfirmasi Password" : "Confirm Password"}</label>
              <div className="input-with-icon">
                <FiLock className="input-icon-v" />
                <input 
                  type={showConfirm ? "text" : "password"} 
                  placeholder="Confirm Password" 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                />
                <button type="button" className="eye-icon-v" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-auth-primary">{language === "ID" ? "Daftar" : "Sign Up"}</button>
          </form>

          <p className="auth-footer">
            {language === "ID" ? "Sudah punya akun?" : "Already have an account?"} <Link to="/login">{language === "ID" ? "Masuk" : "Login"}</Link>
          </p>
        </div>

        <div className="auth-right">
          <img src={illuImg} alt="Illustration" />
        </div>
      </div>
    </div>
  );
}

export default Register;