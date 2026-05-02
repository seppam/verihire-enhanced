import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { authService } from "../services/authService";
import "./login.css"; // Kita pakai CSS yang sama biar rapi

// IMPORT GAMBAR DARI ASSETS
import logoImg from "../assets/logo.png";
import illuImg from "../assets/illustration-login.png";

function ForgotPassword({ language }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setStatusMsg({ type: 'error', text: language === "ID" ? "Masukkan email anda!" : "Please enter your email!" });
      return;
    }

    setStatusMsg({ type: '', text: '' });
    setIsLoading(true);
    try {
      const res = await authService.forgotPassword({ email });
      if (res.success || res.message) {
        setStatusMsg({ 
          type: 'success', 
          text: res.message || (language === "ID" 
            ? "Instruksi reset password telah dikirim ke email anda." 
            : "Reset instructions have been sent to your email.")
        });
        setTimeout(() => navigate("/login"), 3000);
      }
    } catch (error) {
      setStatusMsg({ 
        type: 'error', 
        text: error.response?.data?.message || (language === "ID" ? "Gagal mengirim email reset." : "Failed to send reset email.")
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-left">
          <div className="auth-logo">
            <img src={logoImg} alt="VeriHire" />
          </div>
          
          <h2>{language === "ID" ? "Lupa Password?" : "Forgot Password?"}</h2>
          
          {statusMsg.text && (
            <div className={`auth-status-msg ${statusMsg.type}`}>
               {statusMsg.text}
            </div>
          )}

          <p style={{ color: "#64748b", marginBottom: "30px", fontSize: "0.9rem" }}>
            {language === "ID" 
              ? "Jangan khawatir! Masukkan email anda di bawah untuk menerima instruksi reset." 
              : "No worries! Enter your email below to receive reset instructions."}
          </p>
          
          <form onSubmit={handleReset}>
            <div className="auth-group">
              <label>Email</label>
              <div className="input-with-icon">
                <FiMail className="input-icon-v" />
                <input 
                  type="email" 
                  placeholder={language === "ID" ? "Email terdaftar" : "Registered email"} 
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn-auth-primary" disabled={isLoading}>
              {isLoading 
                ? (language === "ID" ? "Mengirim..." : "Sending...") 
                : (language === "ID" ? "Kirim Instruksi" : "Send Instructions")}
            </button>
          </form>

          <p className="auth-footer">
            <Link to="/login" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <FiArrowLeft /> {language === "ID" ? "Kembali ke Login" : "Back to Login"}
            </Link>
          </p>
        </div>

        <div className="auth-right">
          <img src={illuImg} alt="Illustration" />
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;