import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FiLock, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import { authService } from "../services/authService";
import "./login.css";

// IMPORT GAMBAR DARI ASSETS
import logoImg from "../assets/logo.png";
import illuImg from "../assets/illustration-login.png";

function ResetPassword({ language }) {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setStatusMsg({ type: 'error', text: language === "ID" ? "Semua field harus diisi!" : "All fields must be filled!" });
      return;
    }

    if (password !== confirmPassword) {
      setStatusMsg({ type: 'error', text: language === "ID" ? "Password dan konfirmasi password tidak valid/cocok!" : "Passwords do not match!" });
      return;
    }

    setStatusMsg({ type: '', text: '' });
    setIsLoading(true);
    try {
      const res = await authService.resetPassword(token, { password });
      if (res.success || res.message) {
        setStatusMsg({ type: 'success', text: res.message || (language === "ID" ? "Password berhasil direset." : "Password reset successfully.") });
        setTimeout(() => navigate("/login"), 3000);
      }
    } catch (error) {
      setStatusMsg({ type: 'error', text: error.response?.data?.message || (language === "ID" ? "Gagal mereset password." : "Failed to reset password.") });
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
          
          <h2>{language === "ID" ? "Reset Password" : "Reset Password"}</h2>
          
          {statusMsg.text && (
            <div className={`auth-status-msg ${statusMsg.type}`}>
               {statusMsg.text}
            </div>
          )}

          <p style={{ color: "#64748b", marginBottom: "30px", fontSize: "0.9rem" }}>
            {language === "ID" 
              ? "Silakan masukkan password baru Anda." 
              : "Please enter your new password."}
          </p>
          
          <form onSubmit={handleResetPassword}>
            <div className="auth-group">
              <label>{language === "ID" ? "Password Baru" : "New Password"}</label>
              <div className="input-with-icon">
                <FiLock className="input-icon-v" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder={language === "ID" ? "Masukkan kata sandi baru" : "Enter new password"} 
                  value={password}
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

            <div className="auth-group">
              <label>{language === "ID" ? "Konfirmasi Password" : "Confirm Password"}</label>
              <div className="input-with-icon">
                <FiLock className="input-icon-v" />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder={language === "ID" ? "Ketikan ulang kata sandi baru" : "Re-enter new password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button" 
                  className="eye-icon-v"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-auth-primary" disabled={isLoading}>
              {isLoading 
                ? (language === "ID" ? "Menyimpan..." : "Saving...") 
                : (language === "ID" ? "Simpan Password Baru" : "Save New Password")}
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

export default ResetPassword;
