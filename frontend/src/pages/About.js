import React from 'react';
import './about.css';
import logo from '../assets/logo.png';

const About = ({ language }) => {
  const content = {
    ID: {
      badge: "🛡️ Tentang VeriHire",
      title: "Melindungi Pencari Kerja dari",
      fraud: "Penipuan",
      desc: "VeriHire adalah platform berbasis AI yang membantu mendeteksi lowongan kerja palsu dan melindungi pencari kerja dari penipuan.",
      stats: [
        { val: "50K+", lab: "Pekerjaan Discan" },
        { val: "99.2%", lab: "Tingkat Akurasi" },
        { val: "15K+", lab: "Pengguna Aktif" },
        { val: "24/7", lab: "Perlindungan" }
      ],
      featuresTitle: "Kenapa VeriHire?",
      features: [
        { title: "Deteksi Cerdas", desc: "AI kami menganalisis lowongan kerja secara otomatis." },
        { title: "Aman & Terpercaya", desc: "Data kamu terlindungi dengan sistem keamanan tinggi." },
        { title: "Cepat & Real-time", desc: "Hasil analisis muncul dalam hitungan detik." },
        { title: "User Friendly", desc: "Interface sederhana dan mudah digunakan." },
        { title: "Database Luas", desc: "Ribuan data lowongan telah dianalisis." },
        { title: "Gratis Digunakan", desc: "Gunakan fitur utama tanpa biaya." }
      ],
      detectTitle: "Apa yang Kami Deteksi",
      detectDesc: "AI kami menganalisis berbagai indikator penipuan untuk melindungi Anda",
      detects: [
        "Gaji tidak realistis",
        "Permintaan pembayaran di awal",
        "Kontak mencurigakan (WhatsApp, Telegram)",
        "Deskripsi pekerjaan tidak jelas",
        "Bahasa mendesak dan tekanan",
        "Informasi perusahaan tidak lengkap",
        "Kesalahan tata bahasa",
        "Penawaran terlalu bagus untuk jadi nyata"
      ]
    },

    EN: {
      badge: "🛡️ About VeriHire",
      title: "Protecting Job Seekers from",
      fraud: "Fraud",
      desc: "VeriHire is an AI-powered platform that detects fraudulent job postings and protects job seekers from scams.",
      stats: [
        { val: "50K+", lab: "Jobs Scanned" },
        { val: "99.2%", lab: "Accuracy Rate" },
        { val: "15K+", lab: "Active Users" },
        { val: "24/7", lab: "Protection" }
      ],
      featuresTitle: "Why VeriHire?",
      features: [
        { title: "Smart Detection", desc: "Our AI automatically analyzes job postings." },
        { title: "Secure & Trusted", desc: "Your data is protected with high security." },
        { title: "Fast & Real-time", desc: "Results are generated within seconds." },
        { title: "User Friendly", desc: "Simple and easy-to-use interface." },
        { title: "Wide Database", desc: "Thousands of job data have been analyzed." },
        { title: "Free to Use", desc: "Use core features at no cost." }
      ],
      detectTitle: "What We Detect",
      detectDesc: "Our AI analyzes multiple fraud indicators to protect you",
      detects: [
        "Unrealistic salary promises",
        "Requests for upfront payments",
        "Suspicious contact methods (WhatsApp, Telegram)",
        "Vague job descriptions",
        "Urgent or pressure language",
        "Missing company information",
        "Grammar and spelling errors",
        "Too-good-to-be-true offers"
      ]
    }
  };

  const t = content[language || 'ID'];

  return (
    <div className="about-page">
      <div className="container-verihire-final">

        {/* HERO */}
        <span className="badge-ui">{t.badge}</span>

        <h1 className="page-title-final">
          {t.title} <span className="blue-text">{t.fraud}</span>
        </h1>

        <p className="hero-desc">{t.desc}</p>

        {/* STATS */}
        <div className="stats-grid">
          {t.stats.map((s, i) => (
            <div key={i} className="stat-card">
              <h3>{s.val}</h3>
              <p>{s.lab}</p>
            </div>
          ))}
        </div>

        {/* FEATURES */}
        <div className="features-section">
          <h2 className="section-title-final">{t.featuresTitle}</h2>

          <div className="features-grid">
            {t.features.map((item, i) => (
              <div key={i} className="feature-card">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* MISSION */}
        <div className="mission-section">
          <div className="mission-box">
            <h2 className="mission-title">
              {language === 'EN' ? 'Our Mission' : 'Misi Kami'}
            </h2>

            <p className="mission-text">
              {language === 'EN'
                ? "We believe that finding a job should be safe, transparent, and stress-free. VeriHire is designed to help job seekers confidently navigate today’s digital job market by identifying and avoiding fraudulent opportunities. Beyond verification, VeriHire also supports you in improving your CV with smart analysis and actionable insights. From detecting suspicious job patterns to enhancing your resume quality, our platform ensures you are both protected and well-prepared. With VeriHire, you don’t just apply for jobs, you apply with clarity, confidence, and a stronger chance of success."
                : "Kami percaya bahwa mencari pekerjaan seharusnya aman, transparan, dan bebas stres. VeriHire dirancang untuk membantu pencari kerja menavigasi pasar kerja digital saat ini dengan percaya diri dengan mengidentifikasi dan menghindari peluang yang curang. Lebih dari sekadar verifikasi, VeriHire juga mendukung Anda dalam meningkatkan CV Anda dengan analisis cerdas dan wawasan yang dapat ditindaklanjuti. Mulai dari mendeteksi pola pekerjaan yang mencurigakan hingga meningkatkan kualitas resume Anda, platform kami memastikan Anda terlindungi dan siap sedia. Dengan VeriHire, Anda tidak hanya melamar pekerjaan, tetapi melamar dengan jelas, percaya diri, dan peluang sukses yang lebih besar."
              }
            </p>

            <div className="mission-logo">
              <img src={logo} alt="VeriHire Logo" />
            </div>
          </div>
        </div>

        {/* WHAT WE DETECT */}
        <div className="detect-section">
          <h2 className="section-title-final">{t.detectTitle}</h2>
          <p className="detect-desc">{t.detectDesc}</p>

          <div className="detect-grid">
            {t.detects.map((item, i) => (
              <div key={i} className="detect-card">
                <span className="dot"></span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER ABOUT */}
<div className="about-footer">
  <div className="footer-content">
    <img src={logo} alt="VeriHire Logo" className="footer-logo" />
    
    <p className="footer-text">
      © 2026 VeriHire. {language === 'EN' 
        ? 'Protecting job seekers from fraudulent opportunities.'
        : 'Melindungi pencari kerja dari lowongan palsu.'}
    </p>
  </div>
</div>

      </div>
    </div>
  );
};

export default About;