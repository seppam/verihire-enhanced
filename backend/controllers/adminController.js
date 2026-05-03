const User = require('../models/User');
const JobScan = require('../models/JobScan');
const CvAnalysis = require('../models/CvAnalysis');
const Chat = require('../models/Chat');
const catchAsync = require('../utils/catchAsync');

// ─── 1. OVERVIEW / DASHBOARD STATS ──────────────────────────────────────────

exports.getDashboard = catchAsync(async (req, res) => {
  const lang = req.headers['accept-language'] === 'id' ? 'id' : 'en';

  const [
    totalUsers,
    totalAdmins,
    totalPremium,
    totalFree,
    totalScans,
    totalCvAnalyzed,
    totalFake,
    totalLegit,
    totalSuspicious,
    recentUsers,
    scanTrend,
    premiumGrowth,
    topSources,
    topFlaggedSources
  ] = await Promise.all([
    // User counts
    User.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ isPremium: true }),
    User.countDocuments({ isPremium: false, role: 'user' }),

    // Activity counts
    JobScan.countDocuments(),
    CvAnalysis.countDocuments(),

    // Verdict breakdown
    JobScan.countDocuments({ 'analysis.verdict': 'High Risk' }),
    JobScan.countDocuments({ 'analysis.verdict': 'Legit' }),
    JobScan.countDocuments({ 'analysis.verdict': 'Suspicious' }),

    // Recent registrations (last 10)
    User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('username email role isPremium createdAt scanLimit membershipExpires'),

    // Scans per day — last 30 days
    JobScan.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),

    // Premium signups per day — last 30 days
    User.aggregate([
      {
        $match: {
          isPremium: true,
          membershipExpires: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$membershipExpires' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),

    // Scans by source
    JobScan.aggregate([
      { $match: { source: { $ne: null } } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),

    // Fake scans by source (most scam-heavy platforms)
    JobScan.aggregate([
      { $match: { 'analysis.verdict': { $in: ['High Risk', 'Suspicious'] } } },
      { $match: { source: { $ne: null } } },
      { $group: { _id: '$source', fakeCount: { $sum: 1 } } },
      { $sort: { fakeCount: -1 } },
      { $limit: 10 }
    ])
  ]);

  // Build scan trend array (fill missing days with 0)
  const trendMap = {};
  scanTrend.forEach(d => { trendMap[d._id] = d.count; });
  const scanTrendChart = Object.keys(trendMap).sort().map(date => ({
    date,
    count: trendMap[date]
  }));

  // Build premium growth array
  const premiumMap = {};
  premiumGrowth.forEach(d => { premiumMap[d._id] = d.count; });
  const premiumTrendChart = Object.keys(premiumMap).sort().map(date => ({
    date,
    count: premiumMap[date]
  }));

  // Merge flagged source with total for scam-rate %
  const sourceMap = {};
  topSources.forEach(s => { sourceMap[s._id] = { total: s.count }; });
  topFlaggedSources.forEach(s => {
    if (sourceMap[s._id]) sourceMap[s._id].fake = s.fakeCount;
    else sourceMap[s._id] = { total: 0, fake: s.fakeCount };
  });
  const sourceAnalysis = Object.entries(sourceMap)
    .map(([source, data]) => ({
      source,
      total: data.total || 0,
      fake: data.fake || 0,
      scamRate: data.total > 0 ? Math.round((data.fake || 0) / data.total * 100) : 0
    }))
    .sort((a, b) => b.total - a.total);

  // Recent activity: latest scans
  const recentScans = await JobScan.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'username email')
    .select('scanTitle analysis.verdict analysis.score source createdAt user');

  // Avg CV score
  const avgCvScore = await CvAnalysis.aggregate([
    { $match: { 'analysis.cvMatchScore': { $exists: true } } },
    { $group: { _id: null, avg: { $avg: '$analysis.cvMatchScore' } } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalAdmins,
        totalPremium,
        totalFree,
        totalScans,
        totalCvAnalyzed,
        totalFake,
        totalLegit,
        totalSuspicious,
        avgCvScore: avgCvScore[0]?.avg ? Math.round(avgCvScore[0].avg) : 0,
        scamRate: totalScans > 0 ? Math.round(totalFake / totalScans * 100) : 0
      },
      recentUsers,
      recentScans,
      scanTrendChart,
      premiumTrendChart,
      sourceAnalysis
    }
  });
});

// ─── 2. ALL USERS ──────────────────────────────────────────────────────────

exports.getAllUsers = catchAsync(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const role = req.query.role;       // 'user' | 'admin'
  const isPremium = req.query.isPremium; // 'true' | 'false'
  const search = req.query.search;    // username or email

  const filter = {};
  if (role) filter.role = role;
  if (isPremium !== undefined) filter.isPremium = isPremium === 'true';
  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-passwordResetToken -passwordResetExpires -processedTransactions'),
    User.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      itemsPerPage: limit
    },
    data: users
  });
});

// ─── 3. GET SINGLE USER DETAIL ─────────────────────────────────────────────

exports.getUserDetail = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-passwordResetToken -passwordResetExpires -processedTransactions');

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const [jobScans, cvScans] = await Promise.all([
    JobScan.find({ user: user._id }).sort({ createdAt: -1 }).limit(20),
    CvAnalysis.find({ user: user._id }).sort({ createdAt: -1 }).limit(20)
  ]);

  res.status(200).json({
    success: true,
    data: { user, jobScans, cvScans }
  });
});

// ─── 4. UPDATE USER (ADMIN) ─────────────────────────────────────────────────

exports.updateUser = catchAsync(async (req, res) => {
  const { role, isPremium, scanLimit, membershipExpires } = req.body;

  const updates = {};
  if (role !== undefined) updates.role = role;
  if (isPremium !== undefined) updates.isPremium = isPremium;
  if (scanLimit !== undefined) updates.scanLimit = Math.max(0, parseInt(scanLimit, 10) || 0);
  if (membershipExpires !== undefined) {
    updates.membershipExpires = membershipExpires ? new Date(membershipExpires) : null;
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    .select('-passwordResetToken -passwordResetExpires -processedTransactions');

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  res.status(200).json({ success: true, data: user });
});

// ─── 5. DELETE USER ─────────────────────────────────────────────────────────

exports.deleteUser = catchAsync(async (req, res) => {
  // Prevent admin from deleting themselves
  if (req.params.id === String(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'You cannot delete your own account.'
    });
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  // Cascade delete their scans and CV analyses
  await Promise.all([
    JobScan.deleteMany({ user: req.params.id }),
    CvAnalysis.deleteMany({ user: req.params.id }),
    Chat.deleteMany({ userId: req.params.id })
  ]);

  res.status(200).json({ success: true, message: 'User and all associated data deleted.' });
});

// ─── 6. ALL SCANS ───────────────────────────────────────────────────────────

exports.getAllScans = catchAsync(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const verdict = req.query.verdict;   // 'High Risk' | 'Suspicious' | 'Legit'
  const source = req.query.source;     // whatsapp | telegram | instagram | etc.

  const filter = {};
  if (verdict) filter['analysis.verdict'] = verdict;
  if (source) filter.source = source;

  const [scans, total] = await Promise.all([
    JobScan.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username email'),
    JobScan.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    count: scans.length,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      itemsPerPage: limit
    },
    data: scans
  });
});

// ─── 7. ALL CV ANALYSES ────────────────────────────────────────────────────

exports.getAllCvAnalyses = catchAsync(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [analyses, total] = await Promise.all([
    CvAnalysis.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username email')
      .select('-cvText'),
    CvAnalysis.countDocuments()
  ]);

  res.status(200).json({
    success: true,
    count: analyses.length,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      itemsPerPage: limit
    },
    data: analyses
  });
});
