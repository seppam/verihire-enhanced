import "./profile.css";
import React, { useState, useEffect } from "react";
import { authService } from "../services/authService";
import { historyService } from "../services/historyService";
import { statsService } from "../services/statsService";
import { paymentService } from "../services/paymentService";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLayers, FiShield, FiFilePlus, FiActivity, FiStar, FiDownload, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { jsPDF } from "jspdf";

const Profile = ({ user, language }) => {
  const navigate = useNavigate();
  const isID = language === 'ID';

  // ================= TRANSLATIONS =================
  const content = {
    ID: {
      editBtn: "Edit Profil",
      passBtn: "Ganti Password",
      joined: "Bergabung:",
      totalScan: "Total Scan:",
      btnDelete: "HAPUS",
      btnDetails: "Details",
      btnSave: "Simpan",
      btnCancel: "Batal",
      labelUser: "Username",
      labelEmail: "Email",
      labelAvatar: "Pilih Avatar",
      labelOldPass: "Password Lama",
      labelNewPass: "Password Baru",
      labelConfirmPass: "Konfirmasi Password",
      alertSuccess: "Password berhasil diubah!",
      jobTitle: "Riwayat Scan Lowongan",
      cvTitle: "Riwayat Scan CV",
      colNo: "No. Scan",
      colContent: "Konten Scan",
      colType: "Tipe",
      colDate: "Tanggal",
      colResult: "Hasil",
      colAction: "Aksi",
      colCVName: "Nama File CV",
      colScore: "Skor CV",
      colMatch: "Status Kecocokan"
    },
    EN: {
      editBtn: "Edit Profile",
      passBtn: "Change Password",
      joined: "Joined:",
      totalScan: "Total Scan:",
      btnDelete: "DELETE",
      btnDetails: "Details",
      btnSave: "Save",
      btnCancel: "Cancel",
      labelUser: "Username",
      labelEmail: "Email",
      labelAvatar: "Choose Avatar",
      labelOldPass: "Old Password",
      labelNewPass: "New Password",
      labelConfirmPass: "Confirm Password",
      alertSuccess: "Password updated successfully!",
      jobTitle: "Scan Job History",
      cvTitle: "Scan CV History",
      colNo: "Scan Number",
      colContent: "Scan Content",
      colType: "Scan Type",
      colDate: "Date",
      colResult: "Result",
      colAction: "Action",
      colCVName: "CV File Name",
      colScore: "CV Score",
      colMatch: "CV Match Status"
    }
  };

  const t = content[language || 'ID'];

  const avatarOptions = [
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    "https://cdn-icons-png.flaticon.com/512/3135/3135768.png",
    "https://cdn-icons-png.flaticon.com/512/4128/4128176.png",
    "https://cdn-icons-png.flaticon.com/512/3135/3135789.png",
    "https://cdn-icons-png.flaticon.com/512/6997/6997662.png",
    "https://cdn-icons-png.flaticon.com/512/4128/4128335.png"
  ];

  // ================= STATE =================
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [scanData, setScanData] = useState([]);
  const [cvData, setCvData] = useState([]);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [selectedCvDetail, setSelectedCvDetail] = useState(null);
  const [selectedJobDetail, setSelectedJobDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const [jobSortConfig, setJobSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [cvSortConfig, setCvSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [userStats, setUserStats] = useState({
     jobTotal: 0,
     scamsAvoided: 0,
     cvTotal: 0,
     avgCvScore: 0,
     bestCvScore: 0
  });

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");

  const [displayUser, setDisplayUser] = useState(user || {});
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) setDisplayUser(user);
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const statsRes = await statsService.getUserStats();
      if (statsRes.success || statsRes.data) {
         const d = statsRes.data || statsRes;
         setUserStats({
           jobTotal: d.jobTotal || 0,
           scamsAvoided: d.scamsAvoided || 0,
           cvTotal: d.cvTotal || 0,
           avgCvScore: d.avgCvScore || 0,
           bestCvScore: d.bestCvScore || 0
         });
      }

      const scanRes = await historyService.getScanHistory(1, 50);
      if (scanRes.success) {
        setScanData(scanRes.data || []);
      }
      const cvRes = await historyService.getCvHistory(1, 50);
      if (cvRes.success) {
        setCvData(cvRes.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch history/stats", error);
    }
  };

  const username = displayUser?.username || "Anindya Chandra";
  const email = displayUser?.email || "anindya.chandra@email.com";
  const joinDate = displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString() : (isID ? "Baru saja" : "Just now");
  const avatarLetter = username.charAt(0).toUpperCase();

  // ================= HANDLERS =================
  const handleSave = async () => {
    if (avatar && avatar.length > 2000000) {
      setStatusMsg({ type: 'error', text: isID ? "Ukuran gambar avatar terlalu besar! Maksimal 2MB." : "Avatar image is too large! Maximum allowed is 2MB." });
      return;
    }

    try {
      const response = await authService.updateProfile({ username: newUsername, email: newEmail, avatar });
      if (response.success) {
        const updatedUser = response.data?.user || response.data || {};
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const newUser = { 
           ...currentUser, 
           username: newUsername, 
           email: newEmail, 
           avatar, 
           ...updatedUser 
        };
        localStorage.setItem("user", JSON.stringify(newUser));
        setDisplayUser(newUser);
        setIsEditing(false);
      }
    } catch (error) {
      setStatusMsg({ type: 'error', text: error.response?.data?.message || "Update profile failed" });
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: isID ? "Password baru dan konfirmasi tidak cocok!" : "Passwords do not match" });
      return;
    }
    
    try {
      const res = await authService.updatePassword({ currentPassword: oldPassword, newPassword });
      if (res.success) {
        setStatusMsg({ type: 'success', text: isID ? "Password berhasil diubah." : "Password updated successfully." });
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setStatusMsg({ type: 'error', text: error.response?.data?.message || "Failed to update password" });
    }
  };

  const handleUpgrade = () => {
    // ALWAYS open modal as per confirmation step requirement
    setPhoneInput(displayUser?.phoneNumber || "");
    setIsPhoneModalOpen(true);
  };

  const handlePhoneSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // BASIC VALIDATION
    const cleanPhone = phoneInput.replace(/[\s-]/g, '');
    
    if (!cleanPhone) {
        setStatusMsg({ type: 'error', text: isID ? "Nomor telepon tidak boleh kosong." : "Phone number cannot be empty." });
        return;
    }
    
    if (!/^\+?[0-9]+$/.test(cleanPhone)) {
        setStatusMsg({ type: 'error', text: isID ? "Nomor telepon hanya boleh berisi angka (dan '+' di awal)." : "Phone number can only contain numbers (and a leading '+')." });
        return;
    }
    
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        setStatusMsg({ type: 'error', text: isID ? "Nomor telepon harus antara 10 - 15 karakter." : "Phone number must be between 10 - 15 characters." });
        return;
    }

    try {
      setPaymentLoading(true);
      console.log("Token being used for our internal API:", localStorage.getItem('token'));
      const res = await paymentService.createCheckoutSession({ phoneNumber: cleanPhone });
      if (res.success && res.checkoutUrl) {
        window.open(res.checkoutUrl, '_blank');
      }
    } catch (error) {
      setStatusMsg({ type: 'error', text: error.response?.data?.message || "Failed to initiate payment" });
    } finally {
      setPaymentLoading(false);
      setIsPhoneModalOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === 'job') {
        await historyService.deleteScan(deleteTarget.id);
        setScanData(prev => prev.filter(item => item._id !== deleteTarget.id));
      } else if (deleteTarget.type === 'cv') {
        await historyService.deleteCv(deleteTarget.id);
        setCvData(prev => prev.filter(item => item._id !== deleteTarget.id));
      }
    } catch (error) {
      setStatusMsg({ type: 'error', text: "Delete failed" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleViewCvDetail = async (id) => {
    try {
      const res = await historyService.getCvDetail(id);
      if (res.success) {
        setSelectedCvDetail(res.data);
      }
    } catch (error) {
      setStatusMsg({ type: 'error', text: "Failed to get CV detail" });
    }
  };

  const handleViewJobDetail = async (id) => {
    try {
      const res = await historyService.getScanDetail(id);
      if (res.success) {
        setSelectedJobDetail(res.data);
      }
    } catch (error) {
      setStatusMsg({ type: 'error', text: "Failed to get Job Scan detail" });
    }
  };

  const handleDownloadHistoryPDF = () => {
    if (!selectedCvDetail || !selectedCvDetail.improvedCvText) {
      setStatusMsg({ type: 'error', text: isID ? "Teks CV tidak ditemukan!" : "CV text not found for download." });
      return;
    }
    
    const safeText = String(selectedCvDetail.improvedCvText).replace(/[^\x20-\x7E\n\r]/g, "");
    
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Improved CV Output", 15, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const textLines = doc.splitTextToSize(safeText, 180);
    
    let yIdx = 30;
    textLines.forEach(line => {
      if (yIdx > 280) {
        doc.addPage();
        yIdx = 20;
      }
      doc.text(line, 15, yIdx);
      yIdx += 6;
    });
    doc.save("History_Improved_CV.pdf");
  };

  const handleJobSort = (key) => {
    let direction = 'desc';
    if (jobSortConfig.key === key && jobSortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setJobSortConfig({ key, direction });
  };

  const handleCvSort = (key) => {
    let direction = 'desc';
    if (cvSortConfig.key === key && cvSortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setCvSortConfig({ key, direction });
  };

  const renderSortIcon = (config, key) => {
    if (config.key !== key) {
      return <FiChevronDown style={{ color: '#888', marginLeft: '4px', opacity: 0.5 }} />;
    }
    return config.direction === 'desc' 
      ? <FiChevronDown style={{ marginLeft: '4px' }} /> 
      : <FiChevronUp style={{ marginLeft: '4px' }} />;
  };

  const sortedScanData = [...scanData].sort((a, b) => {
    let valA, valB;
    if (jobSortConfig.key === 'result') {
      valA = (a.analysis?.verdict || "").toLowerCase();
      valB = (b.analysis?.verdict || "").toLowerCase();
    } else {
      // default to date
      valA = new Date(a.createdAt);
      valB = new Date(b.createdAt);
    }

    if (valA < valB) return jobSortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return jobSortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const sortedCvData = [...cvData].sort((a, b) => {
    let valA, valB;
    if (cvSortConfig.key === 'score') {
      valA = a.analysis?.cvMatchScore || 0;
      valB = b.analysis?.cvMatchScore || 0;
    } else if (cvSortConfig.key === 'status') {
      valA = (a.analysis?.matchStatus || "").toLowerCase();
      valB = (b.analysis?.matchStatus || "").toLowerCase();
    } else {
      // default to date
      valA = new Date(a.createdAt);
      valB = new Date(b.createdAt);
    }

    if (valA < valB) return cvSortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return cvSortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="profile-wrapper-final container-verihire-final">
      <div className="container">
        
        {/* SECTION 1: PROFILE CARD */}
        {!isChangingPassword && (
          <section className="user-card-final">
            {statusMsg.text && (
              <div className={`auth-status-msg ${statusMsg.type}`} style={{ margin: '0 20px 20px' }}>
                {statusMsg.text}
              </div>
            )}
            <div className="avatar-side-final">
              <div className="avatar-box-final">
                {avatar ? <img src={avatar} alt="avatar" className="avatar-img" /> : <span className="avatar-letter">{avatarLetter}</span>}
              </div>
              {isEditing && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '15px' }}>
                  {avatarOptions.map((img, i) => (
                    <div key={i} onClick={() => setAvatar(img)}>
                      <img 
                        src={img} 
                        alt="option" 
                        style={{
                          width: '60px', 
                          height: '60px', 
                          objectFit: 'cover', 
                          borderRadius: '50%', 
                          cursor: 'pointer',
                          border: avatar === img ? '3px solid #4f46e5' : '3px solid transparent'
                        }} 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="profile-form-side">
              {isEditing ? (
                <div className="edit-form-final">
                  <div className="form-group-final"><label>{t.labelUser}</label><input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} /></div>
                  <div className="form-group-final"><label>{t.labelEmail}</label><input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></div>
                  <div className="action-buttons-final">
                    <button onClick={handleSave} className="btn-primary-final">{t.btnSave}</button>
                    <button onClick={() => setIsEditing(false)} className="btn-secondary-final">{t.btnCancel}</button>
                  </div>
                </div>
              ) : (
                <div className="user-info-display">
                  <h1>{username}</h1>
                  <p className="joined-text">{email}</p>
                  <div className="stats-row-final">
                    <span><strong>{t.joined}</strong> {joinDate}</span>
                    <span className="dot-separator">•</span>
                    <span><strong>{t.totalScan}</strong> {scanData.length + cvData.length}</span>
                  </div>
                  <div className="action-buttons-final">
                    <button onClick={() => setIsEditing(true)} className="btn-primary-final">{t.editBtn}</button>
                    <button onClick={() => setIsChangingPassword(true)} className="btn-secondary-final">{t.passBtn}</button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* SECTION: MEMBERSHIP & QUOTA */}
        {!isChangingPassword && (
          <section className="user-card-final" style={{ marginTop: '20px', borderLeft: '6px solid #4f46e5' }}>
            <div className="profile-form-side" style={{ width: '100%', padding: '10px 20px' }}>
              <h2 style={{ color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiShield style={{ color: '#4f46e5' }} /> 
                {isID ? "Keanggotaan & Kuota" : "Membership & Quota"}
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                    {isID ? "Kuota Tersisa" : "Remaining Tokens"}
                  </p>
                  <h3 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>
                    {displayUser?.scanLimit || 0} <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 'normal' }}>Scans</span>
                  </h3>
                </div>

                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                    {isID ? "Status Paket" : "Current Plan"}
                  </p>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', color: displayUser?.isPremium ? '#10b981' : '#64748b' }}>
                    {displayUser?.isPremium ? (isID ? "Member Premium" : "Premium Member") : (isID ? "Paket Gratis" : "Free Plan")}
                  </h3>
                  {displayUser?.isPremium && displayUser?.premiumValidUntil && (
                    <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                      {isID ? "Aktif sampai:" : "Active until:"} {new Date(displayUser.premiumValidUntil).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {(displayUser?.isPremium && displayUser?.membershipExpires && new Date(displayUser.membershipExpires) > new Date()) ? (
                // PREMIUM EXTENSION UX
                <div style={{ marginTop: '25px', padding: '20px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '12px', color: '#fff', textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
                    {isID ? "Perpanjang Masa Premium!" : "Extend Your Premium!"}
                  </h4>
                  <p style={{ margin: '0 0 20px 0', fontSize: '14px', opacity: 0.9 }}>
                    {isID 
                      ? `Keanggotaan Anda saat ini berakhir pada ${new Date(displayUser.membershipExpires).toLocaleDateString()}. Klik di bawah untuk memperpanjang +120 token.` 
                      : `Your current membership ends on ${new Date(displayUser.membershipExpires).toLocaleDateString()}. Click below to extend for +120 tokens.`}
                  </p>
                  <button 
                    onClick={handleUpgrade}
                    disabled={paymentLoading}
                    style={{ 
                      backgroundColor: '#fff', 
                      color: '#059669', 
                      padding: '12px 30px', 
                      borderRadius: '8px', 
                      border: 'none', 
                      fontWeight: 'bold', 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    {paymentLoading ? (isID ? "Memproses..." : "Processing...") : (isID ? "Extend Premium (+120 Tokens)" : "Extend Premium (+120 Tokens)")}
                  </button>
                </div>
              ) : (
                // NEW UPGRADE UX
                <div style={{ marginTop: '25px', padding: '20px', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', borderRadius: '12px', color: '#fff', textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
                    {isID ? "Upgrade ke Premium Sekarang!" : "Upgrade to Premium Now!"}
                  </h4>
                  <p style={{ margin: '0 0 20px 0', fontSize: '14px', opacity: 0.9 }}>
                    {isID 
                      ? "Dapatkan tambahan 120 token scan dan akses penuh selama 2 bulan hanya dengan Rp 50.000." 
                      : "Get 120 additional scan tokens and full access for 2 months for only Rp 50,000."}
                  </p>
                  <button 
                    onClick={handleUpgrade}
                    disabled={paymentLoading}
                    style={{ 
                      backgroundColor: '#fff', 
                      color: '#4f46e5', 
                      padding: '12px 30px', 
                      borderRadius: '8px', 
                      border: 'none', 
                      fontWeight: 'bold', 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    {paymentLoading ? (isID ? "Memproses..." : "Processing...") : (isID ? "Upgrade ke Premium (Rp 50rb)" : "Upgrade to Premium (50k)")}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* SECTION 2: CHANGE PASSWORD */}
        {isChangingPassword && (
          <section className="user-card-final">
            <div className="profile-form-side" style={{ width: '100%' }}>
              <h2 className="figma-blue-title">{t.passBtn}</h2>
              {statusMsg.text && (
                <div className={`auth-status-msg ${statusMsg.type}`} style={{ marginBottom: '20px' }}>
                  {statusMsg.text}
                </div>
              )}
              <div className="edit-form-final" style={{ gridTemplateColumns: '1fr' }}>
                <div className="form-group-final" style={{ position: 'relative' }}>
                   <label>{t.labelOldPass}</label>
                   <input type={showOldPassword ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} style={{ width: '100%', paddingRight: '40px' }} />
                   <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-10%)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#666' }}>{showOldPassword ? <FiEyeOff /> : <FiEye />}</button>
                </div>
                <div className="form-group-final" style={{ position: 'relative' }}>
                   <label>{t.labelNewPass}</label>
                   <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: '100%', paddingRight: '40px' }} />
                   <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-10%)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#666' }}>{showNewPassword ? <FiEyeOff /> : <FiEye />}</button>
                </div>
                <div className="form-group-final" style={{ position: 'relative' }}>
                   <label>{t.labelConfirmPass}</label>
                   <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: '100%', paddingRight: '40px' }} />
                   <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-10%)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#666' }}>{showConfirmPassword ? <FiEyeOff /> : <FiEye />}</button>
                </div>
                <div className="action-buttons-final">
                  <button onClick={handleUpdatePassword} className="btn-primary-final">{t.btnSave}</button>
                  <button onClick={() => setIsChangingPassword(false)} className="btn-secondary-final">{t.btnCancel}</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PERSONAL DASHBOARD STATS */}
        {!isChangingPassword && (
          <section className="user-stats-section" style={{ margin: '30px 0', display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
             <div style={{ flex: '1 1 18%', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textAlign: 'center' }}>
               <FiLayers style={{ fontSize: '24px', color: '#4f46e5', marginBottom: '10px' }} />
               <h3 style={{ margin: '0 0 5px 0', fontSize: '22px', color: '#333' }}>{userStats.jobTotal}</h3>
               <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{isID ? "Scan Lowongan" : "Job Scans"}</p>
             </div>
             <div style={{ flex: '1 1 18%', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textAlign: 'center' }}>
               <FiShield style={{ fontSize: '24px', color: '#10b981', marginBottom: '10px' }} />
               <h3 style={{ margin: '0 0 5px 0', fontSize: '22px', color: '#333' }}>{userStats.scamsAvoided}</h3>
               <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{isID ? "Penipuan Dihindari" : "Scams Avoided"}</p>
             </div>
             <div style={{ flex: '1 1 18%', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textAlign: 'center' }}>
               <FiFilePlus style={{ fontSize: '24px', color: '#f59e0b', marginBottom: '10px' }} />
               <h3 style={{ margin: '0 0 5px 0', fontSize: '22px', color: '#333' }}>{userStats.cvTotal}</h3>
               <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{isID ? "CV Dioptimasi" : "CVs Optimized"}</p>
             </div>
             <div style={{ flex: '1 1 18%', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textAlign: 'center' }}>
               <FiActivity style={{ fontSize: '24px', color: '#ec4899', marginBottom: '10px' }} />
               <h3 style={{ margin: '0 0 5px 0', fontSize: '22px', color: '#333' }}>{userStats.avgCvScore}%</h3>
               <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{isID ? "Skor CV Rata-rata" : "Avg CV Score"}</p>
             </div>
             <div style={{ flex: '1 1 18%', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textAlign: 'center' }}>
               <FiStar style={{ fontSize: '24px', color: '#eab308', marginBottom: '10px' }} />
               <h3 style={{ margin: '0 0 5px 0', fontSize: '22px', color: '#333' }}>{userStats.bestCvScore}%</h3>
               <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{isID ? "Skor CV Terbaik" : "Best CV Score"}</p>
             </div>
          </section>
        )}

        {/* SECTION 3: HISTORY - FIGMA SYNC */}
        {!isChangingPassword && (
          <div className="history-wrapper-figma">
            {/* JOB HISTORY */}
            <section className="history-card-final">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 className="figma-blue-title" style={{ margin: 0 }}>{t.jobTitle}</h2>
              </div>
              <div className="table-container-final">
                <table className="table-final figma-style">
                  <thead>
                    <tr>
                      <th>{t.colNo}</th>
                      <th>{t.colContent}</th>
                      <th>{t.colType}</th>
                      <th onClick={() => handleJobSort('date')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {t.colDate} {renderSortIcon(jobSortConfig, 'date')}
                        </div>
                      </th>
                      <th onClick={() => handleJobSort('result')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {t.colResult} {renderSortIcon(jobSortConfig, 'result')}
                        </div>
                      </th>
                      <th>{t.colAction}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedScanData.map((item, i) => (
                      <tr key={item._id || i}>
                        <td>{i + 1}</td>
                        <td className="bold-text">{item.scanTitle || item.source || "Text Scan"}</td>
                        <td>{item.inputType || "Text"}</td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td className={`res-col ${(item.analysis?.verdict?.toLowerCase().includes('risk') || item.analysis?.verdict?.includes('Risiko')) ? 'high-risk' : 'legit'}`}>{item.analysis?.verdict || "Safe"}</td>
                        <td>
                          <div className="action-flex">
                            <button type="button" className="btn-details-blue" onClick={() => handleViewJobDetail(item._id)}>{t.btnDetails}</button>
                            <button type="button" className="btn-delete-figma" onClick={() => setDeleteTarget({ type: 'job', id: item._id })}>{t.btnDelete}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* CV HISTORY */}
            <section className="history-card-final">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 className="figma-blue-title" style={{ margin: 0 }}>{t.cvTitle}</h2>
              </div>
              <div className="table-container-final">
                <table className="table-final figma-style">
                  <thead>
                    <tr>
                      <th>{t.colNo}</th>
                      <th>{t.colCVName}</th>
                      <th onClick={() => handleCvSort('date')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {t.colDate} {renderSortIcon(cvSortConfig, 'date')}
                        </div>
                      </th>
                      <th onClick={() => handleCvSort('score')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {t.colScore} {renderSortIcon(cvSortConfig, 'score')}
                        </div>
                      </th>
                      <th onClick={() => handleCvSort('status')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {t.colMatch} {renderSortIcon(cvSortConfig, 'status')}
                        </div>
                      </th>
                      <th>{t.colAction}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCvData.map((cv, i) => (
                      <tr key={cv._id || i}>
                        <td>{i + 1}</td>
                        <td className="bold-text">{cv.cvFileName || "CV " + (i+1)}</td>
                        <td>{new Date(cv.createdAt).toLocaleDateString()}</td>
                        <td className="score-text">{cv.analysis?.cvMatchScore || 0}</td>
                        <td>{cv.analysis?.matchStatus || "Unrated"}</td>
                        <td>
                          <div className="action-flex">
                            <button type="button" className="btn-details-blue" onClick={() => handleViewCvDetail(cv._id)}>{t.btnDetails}</button>
                            <button type="button" className="btn-delete-figma" onClick={() => setDeleteTarget({ type: 'cv', id: cv._id })}>{t.btnDelete}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {selectedCvDetail && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="modal-card" style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                 <h2 style={{ margin: 0, color: '#333' }}>{isID ? "Detail Riwayat CV" : "CV History Details"}</h2>
                 <button onClick={() => setSelectedCvDetail(null)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888' }}>✖</button>
               </div>
               <div style={{ marginBottom: '15px', fontSize: '15px' }}>
                 <strong style={{ color: '#4f46e5' }}>Target Job:</strong> <br/> {selectedCvDetail.jobTarget || "N/A"}
               </div>
               <div style={{ marginBottom: '15px', fontSize: '15px' }}>
                 <strong style={{ color: '#4f46e5' }}>Match Score:</strong> <br/> <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>{selectedCvDetail.analysis?.cvMatchScore || 0}%</span>
               </div>
               <div style={{ marginBottom: '15px', fontSize: '15px' }}>
                 <strong style={{ color: '#4f46e5' }}>Match Status:</strong> <br/> <span style={{ fontWeight: 'bold' }}>{selectedCvDetail.analysis?.matchStatus || "Unrated"}</span>
               </div>
               <div style={{ marginBottom: '15px', fontSize: '15px' }}>
                 <strong style={{ color: '#4f46e5' }}>Strengths:</strong>
                 <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                   {(selectedCvDetail.analysis?.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
                 </ul>
               </div>
               <div style={{ marginBottom: '15px', fontSize: '15px' }}>
                 <strong style={{ color: '#4f46e5' }}>Weaknesses:</strong>
                 <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                   {(selectedCvDetail.analysis?.weaknesses || []).map((s, i) => <li key={i}>{s}</li>)}
                 </ul>
               </div>
               
               {selectedCvDetail.improvedCvText && (
                 <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center' }}>
                   <button 
                     onClick={handleDownloadHistoryPDF}
                     style={{
                       display: 'flex', alignItems: 'center', gap: '8px',
                       padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#4f46e5', color: '#fff',
                       fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
                     }}
                   >
                     <FiDownload /> {isID ? "Download CV PDF" : "Download PDF"}
                   </button>
                 </div>
               )}
            </div>
          </div>
        )}

        {selectedJobDetail && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="modal-card" style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                 <h2 style={{ margin: 0, color: '#333' }}>{isID ? "Detail Riwayat Job" : "Job History Details"}</h2>
                 <button onClick={() => setSelectedJobDetail(null)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888' }}>✖</button>
               </div>
               <div style={{ marginBottom: '15px', fontSize: '15px' }}>
                 <strong style={{ color: '#4f46e5' }}>Content:</strong> <br/> {selectedJobDetail.scanTitle || selectedJobDetail.source || "N/A"}
               </div>
               <div style={{ marginBottom: '15px', fontSize: '15px' }}>
                 <strong style={{ color: '#4f46e5' }}>Score:</strong> <br/> <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{selectedJobDetail.analysis?.score || 0}%</span>
               </div>
               <div style={{ marginBottom: '15px', fontSize: '15px' }}>
                 <strong style={{ color: '#4f46e5' }}>Verdict:</strong> <br/> <span style={{ fontWeight: 'bold', color: (selectedJobDetail.analysis?.verdict?.toLowerCase().includes('risk') || selectedJobDetail.analysis?.verdict?.includes('Risiko')) ? '#ef4444' : '#10b981' }}>{selectedJobDetail.analysis?.verdict || "Safe"}</span>
               </div>
               <div style={{ marginBottom: '15px', fontSize: '15px' }}>
                 <strong style={{ color: '#4f46e5' }}>Flags:</strong>
                 <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                   {(selectedJobDetail.analysis?.flags || []).map((f, i) => <li key={i}>{f}</li>)}
                 </ul>
               </div>
               <div style={{ marginBottom: '15px', fontSize: '15px' }}>
                 <strong style={{ color: '#4f46e5' }}>Recommendation:</strong> <br/>
                 <p style={{ marginTop: '5px', lineHeight: '1.5' }}>{selectedJobDetail.analysis?.recommendation || "None"}</p>
               </div>
            </div>
          </div>
        )}

        {deleteTarget && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="modal-card" style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#333' }}>{isID ? "Konfirmasi Hapus" : "Confirm Deletion"}</h3>
                <p style={{ marginTop: '10px', color: '#666' }}>{isID ? "Apakah Anda yakin ingin menghapus history ini?" : "Are you sure you want to delete this history?"}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <button 
                  onClick={() => setDeleteTarget(null)} 
                  style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #888', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}>
                  {isID ? "Batal" : "Cancel"}
                </button>
                <button 
                  onClick={handleConfirmDelete} 
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                  {isID ? "Ya, Hapus" : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PHONE NUMBER CONFIRMATION MODAL */}
        {isPhoneModalOpen && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
            <div className="modal-card" style={{ background: '#fff', padding: '35px', borderRadius: '16px', width: '90%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', textAlign: 'center' }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ width: '60px', height: '60px', background: '#eef2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                  <FiShield style={{ fontSize: '28px', color: '#4f46e5' }} />
                </div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#1e293b' }}>
                  {isID ? "Konfirmasi Nomor Telepon" : "Confirm Phone Number"}
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                  {isID 
                    ? "Mohon konfirmasi nomor WhatsApp Anda untuk menerima notifikasi pembayaran dan status langganan." 
                    : "Please confirm your WhatsApp number to receive payment notifications and subscription status."}
                </p>
              </div>

              <form onSubmit={handlePhoneSubmit}>
                <div className="form-group-final" style={{ marginBottom: '25px', textAlign: 'left' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>
                    {isID ? "Nomor WhatsApp" : "WhatsApp Number"}
                  </label>
                  <input 
                    type="text" 
                    value={phoneInput} 
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder={isID ? "Contoh: 08123456789" : "e.g., 08123456789"}
                    style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' }}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button"
                    onClick={() => setIsPhoneModalOpen(false)} 
                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}>
                    {isID ? "Batal" : "Cancel"}
                  </button>
                  <button 
                    type="submit"
                    disabled={paymentLoading}
                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#4f46e5', color: '#fff', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)' }}>
                    {paymentLoading ? (isID ? "Memproses..." : "Processing...") : (isID ? "Lanjutkan" : "Continue")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;