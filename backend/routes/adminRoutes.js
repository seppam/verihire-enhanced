const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/adminMiddleware');

// All admin routes require authentication AND admin role
router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Users
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetail);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Scans & CV
router.get('/scans', adminController.getAllScans);
router.get('/cv-analyses', adminController.getAllCvAnalyses);

module.exports = router;
