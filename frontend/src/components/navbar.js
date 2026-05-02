import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo.png'; 

const Navbar = ({ user, setUser, language, setLanguage, isLoading }) => {
  const location = useLocation();

  const t = (language === 'EN') ? {
    home: "Home",
    scanJob: "Scan Job",
    scanCV: "Scan CV",
    about: "About",
    login: "Login",
    profile: "Profile",
    logout: "Logout"
  } : {
    home: "Beranda",
    scanJob: "Scan Job",
    scanCV: "Scan CV",
    about: "Tentang",
    login: "Masuk",
    profile: "Profil",
    logout: "Keluar"
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <nav className="main-nav-final">
      <div className="nav-container-wrapper">
        <div className="nav-content-final">
          <Link to="/" className="nav-brand-final">
            <img src={logoImg} alt="VeriHire" className="nav-logo-img-final" />
          </Link>

          <div className="nav-right-group-final">
            <ul className="nav-menu-final">
              <li className={location.pathname === '/' ? 'active' : ''}>
                <Link to="/">{t.home}</Link>
              </li>

              <li className={location.pathname === '/scan' ? 'active' : ''}>
                <Link to="/scan">{t.scanJob}</Link>
              </li>

              {/* ✅ HANYA MUNCUL JIKA USER LOGIN */}
              {!isLoading && user && (
                <li className={location.pathname === '/scan-cv' ? 'active' : ''}>
                  <Link to="/scan-cv">{t.scanCV}</Link>
                </li>
              )}

              <li className={location.pathname === '/about' ? 'active' : ''}>
                <Link to="/about">{t.about}</Link>
              </li>
            </ul>

            <div className="nav-lang-final">
              <button className={language === 'EN' ? 'active' : ''} onClick={() => setLanguage('EN')}>EN</button>
              <button className={language === 'ID' ? 'active' : ''} onClick={() => setLanguage('ID')}>ID</button>
            </div>

            <div className="nav-auth-final">
              {isLoading ? (
                <div style={{ width: '80px' }}></div> // Spacer to prevent jump
              ) : user ? (
                <div className="auth-flex-final">
                  <Link to="/profile" className="btn-blue-final">{t.profile}</Link>
                  <button onClick={handleLogout} className="btn-red-final">{t.logout}</button>
                </div>
              ) : (
                <Link to="/login" className="btn-blue-final">{t.login}</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;