# VeriHire Frontend - AI User Interface

The VeriHire frontend is a high-performance React application featuring a professional, premium UI designed to provide a seamless verification experience.

## 🎨 UI/UX Features

- **Auth Persistence**: Integrated root-level re-authentication using the `/api/auth/me` endpoint. Users stay logged in even after page refreshes.
- **Layout Lockdown**: Strict **1280px max-width** constraint enforced globally to ensure design integrity on ultrawide monitors.
- **Twin Component Pattern**: `Scan.js` and `ScanCV.js` utilize a unified "split-box" layout with vertical dividers and identical character counters for platform-wide consistency.
- **Glassmorphic Design**: Modern aesthetics with clean gradients and subtle micro-animations.
- **Dual-Language Engine**: Instant switching between Indonesian and English via a centralized localization system.

## ⚙️ Environment Variables

Create a `.env` file in the root of the `frontend/` directory:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_key
```

## 🏗️ Technical Architecture

### Auth Persistence & Verification
The application implements a "Loading Gate" pattern in `App.js`:
1. On load, `isLoading` is set to `true`.
2. The app calls `authService.getMe()` to verify the JWT in `localStorage`.
3. Protected routes (Profile, ScanCV) wait for `isLoading === false` before deciding whether to render or redirect.
4. The Navbar uses the `isLoading` state to prevent the "Login" button from flickering during the check.

### Service-Based Integration
The frontend uses a centralized Axios service layer with interceptors to automatically inject Bearer tokens into every request:

```javascript
// Example Interceptor in api.js
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

### No-Alert Stability
The project follows a strict **"No-Alert Policy"**. All user feedback (errors, warnings, successes) is rendered through localized UI status banners or inline error messages, ensuring a professional, premium flow.

---

## 🛠️ Build Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run in Development**:
   ```bash
   npm run start
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## 🛡️ Security
- **Turnstile Guard**: Protects Guest Scan features from bot abuse.
- **Pre-flight Quota Checks**: The "Scan" button is dynamically disabled if the user has no remaining tokens or if a mandatory file source hasn't been selected.