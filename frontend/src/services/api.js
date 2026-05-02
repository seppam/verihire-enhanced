import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    // Assuming you store the user object or token directly in localStorage
    const userStr = localStorage.getItem("user");
    let token = null;

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        token = user.token || localStorage.getItem("token"); // Fallback in case token is stored separately
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    } else {
      token = localStorage.getItem("token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach App Language for localized backend responses
    const lang = localStorage.getItem("appLang") || 'EN';
    config.headers['Accept-Language'] = lang.toLowerCase();

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // FIX: Don't redirect/clear if we are on the login path or trying to login
      const isLoginRequest = error.config.url.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login"; // Redirect to login
      }
    }
    return Promise.reject(error);
  }
);

export default api;
