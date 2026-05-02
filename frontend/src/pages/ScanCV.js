import React, { useState } from 'react';
import { jsPDF } from "jspdf";
import { aiService } from "../services/aiService";
import { 
  FiUploadCloud, FiFileText, FiCheckCircle, FiCpu, 
  FiShield, FiSearch, FiX, FiCheck, FiInfo, FiBriefcase, FiTrash2, FiAlertCircle 
} from 'react-icons/fi';
import './scanCV.css';

function ScanCV({ language, user }) {
  const isID = language === 'ID';

  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [targetJob, setTargetJob] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dynamicData, setDynamicData] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [scanError, setScanError] = useState("");

  const t = {
    badge: isID ? "Scanner Verifikasi CV" : "CV Verification Scanner",
    title: isID ? "Scan CV Anda" : "Scan Your CV",
    subtitle: isID ? "Unggah CV Anda untuk meningkatkan peluang dalam lamaran kerja" : "Upload your CV to improve your chances in job applications",
    cardLabel: isID ? "Unggah CV" : "CV Document",
    tabUpload: isID ? "Unggah Dokumen" : "Upload Document",
    tabPaste: isID ? "Tempel Teks" : "Paste Text",
    btnScan: isID ? "Scan CV Sekarang" : "Scan Your CV Now",
    targetPlaceholder: isID ? "Masukkan Pekerjaan Target Anda..." : "Input Your Target Job...",
    mTitle: isID ? "Hasil Scan CV" : "CV Scan Results",
    mScore: isID ? "Skor CV" : "CV Score",
    mStrength: isID ? "Kekuatan" : "Strengths",
    mWeakness: isID ? "Kelemahan" : "Weaknesses",
    mAdvice: isID ? "Saran Perbaikan" : "Improvement Advice",
    mRephrase: isID ? "Saran Kalimat" : "Rephrase Suggestions",
    mJobRec: isID ? "Rekomendasi Pekerjaan" : "Job Recommendations",
    howItWorks: isID ? "Cara Kerja" : "How It Works",
    scanInstruction: isID 
      ? "Scan yang terproses oleh AI akan memotong kuota. Pastikan file yang diunggah sudah benar agar kuota tidak terbuang percuma." 
      : "Scans processed by AI will consume your quota. Please double-check your file before uploading to avoid wasting scans."
  };

  const validateFile = (file) => {
    if (!file) return false;
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 
      'image/png', 
      'image/jpg'
    ];

    if (file.size > maxSize) {
      setScanError(isID ? "File terlalu besar! Maksimal 5MB." : "File too large! Maximum 5MB.");
      return false;
    }
    if (!allowedTypes.includes(file.type)) {
      setScanError(isID ? "Format tidak didukung! Gunakan PDF, DOCX, JPG, atau PNG." : "Unsupported format! Use PDF, DOCX, JPG, or PNG.");
      return false;
    }
    setScanError("");
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setScanError("");
    const input = document.getElementById("f-input");
    if (input) input.value = "";
  };

  const handleScan = async () => {
    if (!selectedFile) {
      setScanError(isID ? "Tolong upload file CV Anda!" : "Please upload your CV file!");
      return;
    }

    if (user && user.scanLimit <= 0) {
      setScanError(isID ? "Kuota scan CV Anda habis. Silakan upgrade ke Premium." : "CV scan quota exhausted. Please upgrade to Premium.");
      return;
    }

    setLoading(true);
    setScanError("");

    try {
      const formData = new FormData();
      formData.append("cv", selectedFile);
      if (targetJob) {
        formData.append("jobTarget", targetJob);
      }

      const response = await aiService.analyzeCV(formData);
      
      if (response.success) {
         const apidata = response.data;
         const result = {
           score: apidata.analysis.cvMatchScore,
           status: apidata.analysis.matchStatus.toLowerCase(),
           matchTitle: "Scan Success",
           matchDesc: "Analysis completed successfully.",
           strengths: apidata.analysis.strengths || [],
           weaknesses: apidata.analysis.weaknesses || [],
           advice: apidata.analysis.improvementAdvice?.join(" ") || "No advice.",
           rephrase: apidata.analysis.rephraseSuggestions?.map(r => r.improved) || [],
           jobs: apidata.analysis.jobRecommendations || [],
           improvedCvText: apidata.improvedCvText
         };

         setDynamicData(result);
         setShowModal(true);
      }
    } catch (error) {
       console.error("Upload error", error);
       setScanError(error.response?.data?.message || "Scan failed.");
    } finally {
       setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!dynamicData || !dynamicData.improvedCvText) {
      setScanError(isID ? "Teks CV tidak ditemukan untuk diunduh." : "CV text not found for download.");
      return;
    }
    
    const safeText = String(dynamicData.improvedCvText).replace(/[^\x20-\x7E\n\r]/g, "");
    
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
    doc.save("Improved_CV_Result.pdf");
  };

  return (
    <div className="scan-cv-wrapper-final">
      <div className="container-verihire-final">

        {/* MODAL RESULT (RESPONSIVE FIX) */}
        {showModal && dynamicData && (
          <div className="cv-modal-overlay">
            <div className={`cv-modal-card ${dynamicData.status}`}>
              <button className="cv-close-x" onClick={() => setShowModal(false)}><FiX /></button>
              <h2 className="cv-modal-title">{t.mTitle}</h2>

              <div className="cv-score-header">
                <div className="cv-score-visual">
                  <span className="cv-score-tag">{t.mScore}</span>
                  <div className="cv-score-circle">{dynamicData.score}</div>
                  <span className={`cv-status-badge ${dynamicData.status}`}>
                    {dynamicData.status.toUpperCase()}
                  </span>
                </div>
                <div className="cv-user-info">
                  <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="avatar" className="cv-avatar-fix" />
                  <div className="cv-user-text">
                    <h3>{pastedText.includes("john") ? "John Doe" : pastedText.includes("budi") ? "Budi Santoso" : "User Applicant"}</h3>
                    <p>Target: <span>{targetJob || "Software Engineer"}</span></p>
                  </div>
                </div>
              </div>

              {dynamicData.improvedCvText && (
                <div style={{ marginTop: "15px", marginBottom: "15px", display: "flex", justifyContent: "center" }}>
                  <button 
                    onClick={handleDownloadPDF} 
                    style={{ 
                      padding: "10px 20px", 
                      cursor: "pointer", 
                      border: "none", 
                      borderRadius: "8px", 
                      background: "#4f46e5", 
                      color: "#fff", 
                      fontWeight: "bold",
                      fontSize: "14px",
                      boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.2)"
                    }}>
                     Download Improved CV (PDF)
                  </button>
                </div>
              )}

              <div className="cv-result-grid">
                <div className="cv-result-item match-accent">
                  <h4 className="green-txt"><FiCheckCircle /> {dynamicData.matchTitle}</h4>
                  <p>{dynamicData.matchDesc}</p>
                </div>
                <div className="cv-result-item">
                  <h4 className="blue-txt"><FiCheck /> {t.mStrength}</h4>
                  <ul>{dynamicData.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                </div>
                <div className="cv-result-item">
                  <h4 className="blue-txt"><FiInfo /> {t.mAdvice}</h4>
                  <p>{dynamicData.advice}</p>
                </div>
                <div className="cv-result-item">
                  <h4 className="orange-txt"><FiShield /> {t.mWeakness}</h4>
                  <ul>{dynamicData.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>
                </div>
                <div className="cv-result-item full-width">
                  <h4 className="green-txt"><FiCheckCircle /> {t.mRephrase}</h4>
                  <ul>{dynamicData.rephrase.map((r, i) => <li key={i}>{r}</li>)}</ul>
                </div>
                <div className="cv-result-item full-width job-rec-box">
                  <h4 className="blue-txt"><FiBriefcase /> {t.mJobRec}</h4>
                  <ul>{dynamicData.jobs.map((j, i) => <li key={i}>{j}</li>)}</ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* HERO */}
        <div className="cv-hero">
          <div className="badge-ui"><FiSearch className="mr-5" /> {t.badge}</div>
          <h1 className="page-title-final">{t.title}</h1>
          <p className="cv-sub-main">{t.subtitle}</p>
        </div>

        {/* MAIN CARD */}
        <div className="verihire-card-white">
          <div className="card-label-row"><FiFileText className="blue-icon" /> {t.cardLabel}</div>
          <div className="split-box-container">
            <div className="split-box-col">
              <div className="scan-box-tab">{t.tabUpload}</div>
               <div 
                className={`verihire-dropzone ${dragActive ? 'active-drag' : ''}`}
                onClick={() => document.getElementById('f-input').click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input type="file" id="f-input" hidden onChange={handleFileChange} />
                <FiUploadCloud className="cv-cloud-icon" />
                <p>{isID ? "Seret & lepas file di sini atau klik untuk memilih file (PDF/DOCX, Max 5MB)" : "Drag & drop file here or click to select file (PDF/DOCX, Max 5MB)"}</p>
                {selectedFile && (
                  <div className="cv-file-tag">
                    ✅ {selectedFile.name.length > 20 ? selectedFile.name.substring(0, 17) + '...' : selectedFile.name}
                    <button className="cv-remove-btn" onClick={removeFile}>
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="split-divider-v">
              <div className="v-line-divider"></div>
              <div className="v-or-bubble">OR</div>
              <div className="v-line-divider"></div>
            </div>
            <div className="split-box-col">
              <div className="scan-box-tab muted">{t.tabPaste}</div>
              <div className="textarea-wrapper-final">
                <textarea 
                  className="verihire-textarea-final" 
                  value={pastedText} 
                  onChange={(e) => setPastedText(e.target.value)} 
                  placeholder={isID ? "Tempel teks CV Anda di sini..." : "Paste your CV text here..."} 
                  maxLength={10000}
                />
                <div className="char-count-final">{pastedText.length.toLocaleString()} / 10,000</div>
              </div>
            </div>
          </div>
          <input type="text" className="cv-target-input" placeholder={t.targetPlaceholder} value={targetJob} onChange={(e) => setTargetJob(e.target.value)} />
          {scanError && (
            <div className="cv-error-msg">
              <FiAlertCircle /> {scanError}
            </div>
          )}
          <button 
            className="cv-btn-scan" 
            onClick={handleScan} 
            disabled={loading || (user && user.scanLimit <= 0) || !!scanError}
            style={{ opacity: (user && user.scanLimit <= 0) ? 0.6 : 1 }}
          >
            <FiCpu className="mr-10" /> {loading ? "Analyzing..." : t.btnScan}
          </button>
          
          <p style={{ 
            fontSize: '12px', 
            color: '#64748B', 
            textAlign: 'center', 
            marginTop: '15px',
            fontStyle: 'italic'
          }}>
            {t.scanInstruction}
          </p>
        </div>

        {/* FEATURE CARDS */}
        <div className="cv-features-row">
          <div className="feat-small-card">
            <FiCpu className="feat-icon-blue" />
            <div className="feat-text"><strong>AI-Powered Analysis</strong><p>Smart insights to improve CV</p></div>
          </div>
          <div className="feat-small-card">
            <FiCheckCircle className="feat-icon-blue" />
            <div className="feat-text"><strong>ATS-Friendly Tips</strong><p>Optimize for systems</p></div>
          </div>
          <div className="feat-small-card">
            <FiShield className="feat-icon-blue" />
            <div className="feat-text"><strong>Fast & Secure</strong><p>Data is never stored</p></div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="cv-how-it-works">
          <h2 className="how-title"><FiCheckCircle className="blue-icon" /> {t.howItWorks}</h2>
          <div className="how-grid">
            <div className="how-steps">
              <div className="step">
                <div className="s-num">1</div>
                <div className="s-txt"><strong>Upload CV</strong><p>PDF/DOCX or plain text.</p></div>
              </div>
              <div className="step">
                <div className="s-num">2</div>
                <div className="s-txt"><strong>AI Analysis</strong><p>Analyze alignment with Target Job.</p></div>
              </div>
              <div className="step">
                <div className="s-num">3</div>
                <div className="s-txt"><strong>Improve & Apply</strong><p>Apply with confidence.</p></div>
              </div>
            </div>
            <div className="how-card-blue">
               <ul>
                 <li><FiCheckCircle className="check-blue" /> Resume structure analysis</li>
                 <li><FiCheckCircle className="check-blue" /> Personalized improvement tips</li>
                 <li><FiCheckCircle className="check-blue" /> ATS-friendly suggestions</li>
               </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
export default ScanCV;