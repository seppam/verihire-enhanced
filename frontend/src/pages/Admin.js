import React, { useState, useEffect } from 'react';
import {
  FiUsers, FiShield, FiActivity, FiFileText, FiBarChart2,
  FiTrendingUp, FiAlertTriangle, FiCheckCircle, FiClock,
  FiSearch, FiFilter, FiTrash2, FiEdit2, FiEye,
  FiChevronLeft, FiChevronRight, FiLogOut, FiX,
  FiZap, FiAward, FiTarget, FiLayers
} from 'react-icons/fi';
import { adminService } from '../services/adminService';
import './Admin.css';

const Admin = ({ user, language, onLogout }) => {
  const isID = language === 'ID';
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState('');

  // Users tab
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersSearch, setUsersSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userPremiumFilter, setUserPremiumFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // Scans tab
  const [scans, setScans] = useState([]);
  const [scansPage, setScansPage] = useState(1);
  const [scansTotal, setScansTotal] = useState(0);
  const [verdictFilter, setVerdictFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // CV tab
  const [cvAnalyses, setCvAnalyses] = useState([]);
  const [cvPage, setCvPage] = useState(1);
  const [cvTotal, setCvTotal] = useState(0);

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Edit user modal
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});

  // User detail modal
  const [userDetailModal, setUserDetailModal] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);

  const t = {
    ID: {
      title: 'Admin Dashboard',
      overview: 'Overview',
      users: 'Users',
      scans: 'Scans',
      cvAnalyses: 'CV Analyses',
      logout: 'Logout',
      totalUsers: 'Total Users',
      premiumUsers: 'Premium',
      freeUsers: 'Free Users',
      totalScans: 'Total Scans',
      cvAnalyzed: 'CV Analyzed',
      highRisk: 'High Risk',
      suspicious: 'Suspicious',
      legit: 'Legit',
      scamRate: 'Scam Rate',
      avgCvScore: 'Avg CV Score',
      recentUsers: 'Recent Users',
      scanTrend: 'Scan Trend (30 Days)',
      sourceAnalysis: 'Scam Rate by Source',
      recentScans: 'Recent Scans',
      actions: 'Actions',
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      search: 'Search username or email...',
      filter: 'Filter',
      noData: 'No data available.',
      confirmDelete: 'Are you sure you want to delete this user?',
      cancel: 'Cancel',
      deleted: 'User deleted successfully.',
      saved: 'User updated successfully.',
      role: 'Role',
      premium: 'Premium',
      free: 'Free',
      admin: 'Admin',
      scanLimit: 'Scan Limit',
      expires: 'Expires',
      joined: 'Joined',
      never: 'Never',
      yes: 'Yes',
      no: 'No',
      perPage: 'per page',
      of: 'of',
      premiumGrowth: 'Premium Growth (30 Days)',
      loading: 'Loading...',
      viewDetails: 'View Details',
      userDetails: 'User Details',
      jobHistory: 'Job Scan History',
      cvHistory: 'CV Analysis History',
      scanDate: 'Date',
      scanTitle: 'Title',
      verdict: 'Verdict',
      score: 'Score',
      noHistory: 'No history found.',
      scanLimitLabel: 'Edit Scan Limit',
      membershipLabel: 'Membership Expires',
      save: 'Save Changes',
      roleAdmin: 'Admin',
      roleUser: 'User',
      all: 'All',
      verified: 'Verified',
      pending: 'Pending'
    },
    EN: {
      title: 'Admin Dashboard',
      overview: 'Overview',
      users: 'Users',
      scans: 'Scans',
      cvAnalyses: 'CV Analyses',
      logout: 'Logout',
      totalUsers: 'Total Users',
      premiumUsers: 'Premium',
      freeUsers: 'Free Users',
      totalScans: 'Total Scans',
      cvAnalyzed: 'CV Analyzed',
      highRisk: 'High Risk',
      suspicious: 'Suspicious',
      legit: 'Legit',
      scamRate: 'Scam Rate',
      avgCvScore: 'Avg CV Score',
      recentUsers: 'Recent Users',
      scanTrend: 'Scan Trend (30 Days)',
      sourceAnalysis: 'Scam Rate by Source',
      recentScans: 'Recent Scans',
      actions: 'Actions',
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      search: 'Search username or email...',
      filter: 'Filter',
      noData: 'No data available.',
      confirmDelete: 'Are you sure you want to delete this user?',
      cancel: 'Cancel',
      deleted: 'User deleted successfully.',
      saved: 'User updated successfully.',
      role: 'Role',
      premium: 'Premium',
      free: 'Free',
      admin: 'Admin',
      scanLimit: 'Scan Limit',
      expires: 'Expires',
      joined: 'Joined',
      never: 'Never',
      yes: 'Yes',
      no: 'No',
      perPage: 'per page',
      of: 'of',
      premiumGrowth: 'Premium Growth (30 Days)',
      loading: 'Loading...',
      viewDetails: 'View Details',
      userDetails: 'User Details',
      jobHistory: 'Job Scan History',
      cvHistory: 'CV Analysis History',
      scanDate: 'Date',
      scanTitle: 'Title',
      verdict: 'Verdict',
      score: 'Score',
      noHistory: 'No history found.',
      scanLimitLabel: 'Edit Scan Limit',
      membershipLabel: 'Membership Expires',
      save: 'Save Changes',
      roleAdmin: 'Admin',
      roleUser: 'User',
      all: 'All',
      verified: 'Verified',
      pending: 'Pending'
    }
  };

  const tx = t[language || 'ID'];

  // Fetch dashboard overview
  useEffect(() => {
    if (activeTab === 'overview') fetchDashboard();
  }, [activeTab]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDashboard();
      if (res.success) setDashboardData(res.data);
      else setError('Failed to load dashboard.');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users
  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, usersPage, usersSearch, userRoleFilter, userPremiumFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page: usersPage, limit: 20 };
      if (usersSearch) params.search = usersSearch;
      if (userRoleFilter) params.role = userRoleFilter;
      if (userPremiumFilter) params.isPremium = userPremiumFilter;
      const res = await adminService.getUsers(params);
      if (res.success) {
        setUsers(res.data);
        setUsersTotal(res.pagination.totalItems);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch scans
  useEffect(() => {
    if (activeTab === 'scans') fetchScans();
  }, [activeTab, scansPage, verdictFilter, sourceFilter]);

  const fetchScans = async () => {
    setLoading(true);
    try {
      const params = { page: scansPage, limit: 20 };
      if (verdictFilter) params.verdict = verdictFilter;
      if (sourceFilter) params.source = sourceFilter;
      const res = await adminService.getAllScans(params);
      if (res.success) {
        setScans(res.data);
        setScansTotal(res.pagination.totalItems);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch CV analyses
  useEffect(() => {
    if (activeTab === 'cvAnalyses') fetchCvAnalyses();
  }, [activeTab, cvPage]);

  const fetchCvAnalyses = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllCvAnalyses({ page: cvPage, limit: 20 });
      if (res.success) {
        setCvAnalyses(res.data);
        setCvTotal(res.pagination.totalItems);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // View user detail
  const handleViewUser = async (userId) => {
    setUserDetailLoading(true);
    setUserDetailModal(true);
    try {
      const res = await adminService.getUserDetail(userId);
      if (res.success) setUserDetail(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setUserDetailLoading(false);
    }
  };

  // Open edit modal
  const handleEditUser = (u) => {
    setEditForm({
      role: u.role,
      isPremium: u.isPremium,
      scanLimit: u.scanLimit,
      membershipExpires: u.membershipExpires ? u.membershipExpires.substring(0, 10) : ''
    });
    setEditModal(u._id);
  };

  // Save user edit
  const handleSaveEdit = async () => {
    try {
      const res = await adminService.updateUser(editModal, editForm);
      if (res.success) {
        setEditModal(null);
        fetchUsers();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update user.');
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    try {
      const res = await adminService.deleteUser(deleteTarget);
      if (res.success) {
        setDeleteTarget(null);
        fetchUsers();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete user.');
    }
  };

  const usersTotalPages = Math.ceil(usersTotal / 20);
  const scansTotalPages = Math.ceil(scansTotal / 20);
  const cvTotalPages = Math.ceil(cvTotal / 20);

  const verdictBadgeClass = (v) => {
    if (v === 'High Risk') return 'badge-danger';
    if (v === 'Suspicious') return 'badge-warning';
    return 'badge-success';
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : tx.never;

  const navItems = [
    { key: 'overview', label: tx.overview, icon: <FiBarChart2 /> },
    { key: 'users', label: tx.users, icon: <FiUsers /> },
    { key: 'scans', label: tx.scans, icon: <FiShield /> },
    { key: 'cvAnalyses', label: tx.cvAnalyses, icon: <FiFileText /> }
  ];

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <FiShield className="admin-logo-icon" />
          <span>VeriHire Admin</span>
        </div>

        <nav className="admin-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`admin-nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => setActiveTab(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-badge">
            <span className="admin-avatar">{user?.username?.[0]?.toUpperCase() || 'A'}</span>
            <div className="admin-user-info">
              <small>{user?.username}</small>
              <span className="admin-role-badge">Admin</span>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={onLogout}>
            <FiLogOut />
            <span>{tx.logout}</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <div className="admin-header">
          <h1>{tx.title}</h1>
          <div className="admin-header-right">
            <span className="admin-version">v1.0.0</span>
          </div>
        </div>

        {error && <div className="admin-error-banner">{error}</div>}

        {/* ═══════════════════════ OVERVIEW ═══════════════════════ */}
        {activeTab === 'overview' && (
          <div className="admin-overview">
            {loading ? (
              <div className="admin-loading">{tx.loading}</div>
            ) : dashboardData ? (
              <>
                {/* Stat Cards */}
                <div className="admin-stat-grid">
                  <div className="admin-stat-card">
                    <div className="stat-icon" style={{background: '#e0e7ff'}}><FiUsers style={{color:'#4f46e5'}}/></div>
                    <div className="stat-info">
                      <small>{tx.totalUsers}</small>
                      <strong>{dashboardData.overview.totalUsers}</strong>
                      <span>{dashboardData.overview.totalAdmins} admins</span>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="stat-icon" style={{background: '#dcfce7'}}><FiAward style={{color:'#16a34a'}}/></div>
                    <div className="stat-info">
                      <small>{tx.premiumUsers}</small>
                      <strong>{dashboardData.overview.totalPremium}</strong>
                      <span>{dashboardData.overview.totalFree} free</span>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="stat-icon" style={{background: '#fef3c7'}}><FiActivity style={{color:'#d97706'}}/></div>
                    <div className="stat-info">
                      <small>{tx.totalScans}</small>
                      <strong>{dashboardData.overview.totalScans}</strong>
                      <span>{dashboardData.overview.totalCvAnalyzed} CV scans</span>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="stat-icon" style={{background: '#fee2e2'}}><FiAlertTriangle style={{color:'#dc2626'}}/></div>
                    <div className="stat-info">
                      <small>{tx.scamRate}</small>
                      <strong>{dashboardData.overview.scamRate}%</strong>
                      <span>{dashboardData.overview.totalFake} scams detected</span>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="stat-icon" style={{background: '#f0fdf4'}}><FiCheckCircle style={{color:'#22c55e'}}/></div>
                    <div className="stat-info">
                      <small>{tx.legit}</small>
                      <strong>{dashboardData.overview.totalLegit}</strong>
                      <span>{dashboardData.overview.totalSuspicious} suspicious</span>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="stat-icon" style={{background: '#ede9fe'}}><FiTarget style={{color:'#9333ea'}}/></div>
                    <div className="stat-info">
                      <small>{tx.avgCvScore}</small>
                      <strong>{dashboardData.overview.avgCvScore}%</strong>
                      <span>CV match avg</span>
                    </div>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="admin-charts-row">
                  {/* Scan Trend Bar Chart */}
                  <div className="admin-chart-card">
                    <h3><FiTrendingUp /> {tx.scanTrend}</h3>
                    {dashboardData.scanTrendChart.length > 0 ? (
                      <div className="admin-bar-chart">
                        {dashboardData.scanTrendChart.map((d, i) => {
                          const max = Math.max(...dashboardData.scanTrendChart.map(x => x.count));
                          return (
                            <div key={i} className="bar-col" title={`${d.date}: ${d.count} scans`}>
                              <div className="bar-fill" style={{height: max > 0 ? `${(d.count / max) * 100}%` : '0%'}} />
                              <span className="bar-label">{d.date.slice(5)}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : <p className="no-data">{tx.noData}</p>}
                  </div>

                  {/* Verdict Breakdown */}
                  <div className="admin-chart-card">
                    <h3><FiPieChart /> Verdict Breakdown</h3>
                    <div className="verdict-donut">
                      {[
                        { label: tx.highRisk, value: dashboardData.overview.totalFake, color: '#dc2626' },
                        { label: tx.suspicious, value: dashboardData.overview.totalSuspicious, color: '#d97706' },
                        { label: tx.legit, value: dashboardData.overview.totalLegit, color: '#22c55e' }
                      ].map(item => (
                        <div key={item.label} className="donut-row">
                          <div className="donut-dot" style={{background: item.color}} />
                          <span className="donut-label">{item.label}</span>
                          <div className="donut-bar-bg">
                            <div className="donut-bar-fill" style={{width: `${dashboardData.overview.totalScans > 0 ? item.value / dashboardData.overview.totalScans * 100 : 0}%`, background: item.color}} />
                          </div>
                          <strong>{item.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Source Analysis */}
                <div className="admin-chart-card full-width">
                  <h3><FiLayers /> {tx.sourceAnalysis}</h3>
                  <div className="source-table">
                    <div className="source-table-header">
                      <span>Source</span>
                      <span>Total Scans</span>
                      <span>Scam/Fake</span>
                      <span>Scam Rate</span>
                    </div>
                    {dashboardData.sourceAnalysis.map((s, i) => (
                      <div key={i} className="source-table-row">
                        <span className="source-name">{s.source}</span>
                        <span>{s.total}</span>
                        <span className="fake-count">{s.fake}</span>
                        <div className="scam-rate-bar-wrap">
                          <div className="scam-rate-bar" style={{
                            width: `${s.scamRate}%`,
                            background: s.scamRate > 60 ? '#dc2626' : s.scamRate > 30 ? '#d97706' : '#22c55e'
                          }} />
                          <span>{s.scamRate}%</span>
                        </div>
                      </div>
                    ))}
                    {dashboardData.sourceAnalysis.length === 0 && <p className="no-data">{tx.noData}</p>}
                  </div>
                </div>

                {/* Recent Users + Recent Scans */}
                <div className="admin-recent-row">
                  <div className="admin-chart-card">
                    <h3><FiUsers /> {tx.recentUsers}</h3>
                    <table className="admin-table">
                      <thead><tr><th>User</th><th>Role</th><th>Joined</th></tr></thead>
                      <tbody>
                        {dashboardData.recentUsers.map(u => (
                          <tr key={u._id} onClick={() => { setActiveTab('users'); handleViewUser(u._id); }} style={{cursor:'pointer'}}>
                            <td><strong>{u.username}</strong><br/><small>{u.email}</small></td>
                            <td><span className={`badge-sm ${u.role === 'admin' ? 'badge-purple' : 'badge-gray'}`}>{u.role}</span></td>
                            <td><small>{formatDate(u.createdAt)}</small></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="admin-chart-card">
                    <h3><FiActivity /> {tx.recentScans}</h3>
                    <table className="admin-table">
                      <thead><tr><th>Title</th><th>Result</th><th>Date</th></tr></thead>
                      <tbody>
                        {dashboardData.recentScans.map(s => (
                          <tr key={s._id}>
                            <td><strong>{s.scanTitle}</strong><br/><small>{s.user?.username || 'Guest'}</small></td>
                            <td><span className={`badge-sm ${verdictBadgeClass(s.analysis?.verdict)}`}>{s.analysis?.verdict}</span></td>
                            <td><small>{formatDate(s.createdAt)}</small></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : <p className="no-data">{tx.noData}</p>}
          </div>
        )}

        {/* ═══════════════════════ USERS ═══════════════════════ */}
        {activeTab === 'users' && (
          <div className="admin-section">
            <div className="admin-section-toolbar">
              <div className="admin-search-box">
                <FiSearch />
                <input
                  type="text"
                  placeholder={tx.search}
                  value={usersSearch}
                  onChange={e => { setUsersSearch(e.target.value); setUsersPage(1); }}
                />
              </div>
              <div className="admin-filters">
                <select value={userRoleFilter} onChange={e => { setUserRoleFilter(e.target.value); setUsersPage(1); }}>
                  <option value="">{tx.all} {tx.role}</option>
                  <option value="admin">{tx.roleAdmin}</option>
                  <option value="user">{tx.roleUser}</option>
                </select>
                <select value={userPremiumFilter} onChange={e => { setUserPremiumFilter(e.target.value); setUsersPage(1); }}>
                  <option value="">{tx.all} Status</option>
                  <option value="true">{tx.premium}</option>
                  <option value="false">{tx.free}</option>
                </select>
              </div>
            </div>

            <table className="admin-table full">
              <thead>
                <tr>
                  <th>User</th>
                  <th>{tx.role}</th>
                  <th>{tx.premium}</th>
                  <th>{tx.scanLimit}</th>
                  <th>{tx.expires}</th>
                  <th>{tx.joined}</th>
                  <th>{tx.actions}</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="user-cell">
                        <span className="user-avatar-sm">{u.username[0].toUpperCase()}</span>
                        <div>
                          <strong>{u.username}</strong>
                          <br/><small>{u.email}</small>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge-sm ${u.role === 'admin' ? 'badge-purple' : 'badge-gray'}`}>{u.role}</span></td>
                    <td><span className={`badge-sm ${u.isPremium ? 'badge-green' : 'badge-gray'}`}>{u.isPremium ? tx.yes : tx.no}</span></td>
                    <td><strong>{u.scanLimit}</strong></td>
                    <td><small>{u.membershipExpires ? formatDate(u.membershipExpires) : tx.never}</small></td>
                    <td><small>{formatDate(u.createdAt)}</small></td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon" title={tx.viewDetails} onClick={() => handleViewUser(u._id)}><FiEye /></button>
                        <button className="btn-icon" title={tx.edit} onClick={() => handleEditUser(u)}><FiEdit2 /></button>
                        <button className="btn-icon btn-danger" title={tx.delete} onClick={() => setDeleteTarget(u._id)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan="7" className="no-data">{tx.noData}</td></tr>}
              </tbody>
            </table>

            {/* Pagination */}
            {usersTotalPages > 1 && (
              <div className="admin-pagination">
                <button disabled={usersPage === 1} onClick={() => setUsersPage(p => p - 1)}><FiChevronLeft /></button>
                <span>{usersPage} {tx.of} {usersTotalPages}</span>
                <button disabled={usersPage >= usersTotalPages} onClick={() => setUsersPage(p => p + 1)}><FiChevronRight /></button>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════ SCANS ═══════════════════════ */}
        {activeTab === 'scans' && (
          <div className="admin-section">
            <div className="admin-section-toolbar">
              <div className="admin-filters">
                <select value={verdictFilter} onChange={e => { setVerdictFilter(e.target.value); setScansPage(1); }}>
                  <option value="">{tx.all} Verdict</option>
                  <option value="High Risk">High Risk</option>
                  <option value="Suspicious">Suspicious</option>
                  <option value="Legit">Legit</option>
                </select>
                <select value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setScansPage(1); }}>
                  <option value="">{tx.all} Source</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="telegram">Telegram</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <table className="admin-table full">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>User</th>
                  <th>Source</th>
                  <th>Score</th>
                  <th>{tx.verdict}</th>
                  <th>{tx.scanDate}</th>
                </tr>
              </thead>
              <tbody>
                {scans.map(s => (
                  <tr key={s._id}>
                    <td><strong>{s.scanTitle}</strong></td>
                    <td><small>{s.user?.username || 'Guest'}</small></td>
                    <td><span className="badge-sm badge-gray">{s.source}</span></td>
                    <td><strong>{s.analysis?.score ?? '—'}</strong></td>
                    <td><span className={`badge-sm ${verdictBadgeClass(s.analysis?.verdict)}`}>{s.analysis?.verdict}</span></td>
                    <td><small>{formatDate(s.createdAt)}</small></td>
                  </tr>
                ))}
                {scans.length === 0 && <tr><td colSpan="6" className="no-data">{tx.noData}</td></tr>}
              </tbody>
            </table>

            {scansTotalPages > 1 && (
              <div className="admin-pagination">
                <button disabled={scansPage === 1} onClick={() => setScansPage(p => p - 1)}><FiChevronLeft /></button>
                <span>{scansPage} {tx.of} {scansTotalPages}</span>
                <button disabled={scansPage >= scansTotalPages} onClick={() => setScansPage(p => p + 1)}><FiChevronRight /></button>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════ CV ANALYSES ═══════════════════════ */}
        {activeTab === 'cvAnalyses' && (
          <div className="admin-section">
            <table className="admin-table full">
              <thead>
                <tr>
                  <th>User</th>
                  <th>CV File</th>
                  <th>Target Job</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>{tx.scanDate}</th>
                </tr>
              </thead>
              <tbody>
                {cvAnalyses.map(c => (
                  <tr key={c._id}>
                    <td><small>{c.user?.username || '—'}</small></td>
                    <td><strong>{c.cvFileName}</strong></td>
                    <td><small>{c.jobTarget}</small></td>
                    <td><strong>{c.analysis?.cvMatchScore ?? '—'}%</strong></td>
                    <td><span className={`badge-sm ${c.analysis?.matchStatus === 'Excellent' || c.analysis?.matchStatus === 'High' ? 'badge-green' : c.analysis?.matchStatus === 'Low' ? 'badge-danger' : 'badge-warning'}`}>{c.analysis?.matchStatus}</span></td>
                    <td><small>{formatDate(c.createdAt)}</small></td>
                  </tr>
                ))}
                {cvAnalyses.length === 0 && <tr><td colSpan="6" className="no-data">{tx.noData}</td></tr>}
              </tbody>
            </table>

            {cvTotalPages > 1 && (
              <div className="admin-pagination">
                <button disabled={cvPage === 1} onClick={() => setCvPage(p => p - 1)}><FiChevronLeft /></button>
                <span>{cvPage} {tx.of} {cvTotalPages}</span>
                <button disabled={cvPage >= cvTotalPages} onClick={() => setCvPage(p => p + 1)}><FiChevronRight /></button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ═══════════════════ MODALS ═══════════════════ */}

      {/* Edit User Modal */}
      {editModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>{tx.edit}</h3>
              <button className="btn-icon" onClick={() => setEditModal(null)}><FiX /></button>
            </div>
            <div className="admin-modal-body">
              <label>
                <span>{tx.role}</span>
                <select value={editForm.role} onChange={e => setEditForm(f => ({...f, role: e.target.value}))}>
                  <option value="user">{tx.roleUser}</option>
                  <option value="admin">{tx.roleAdmin}</option>
                </select>
              </label>
              <label>
                <span>{tx.premium}</span>
                <select value={String(editForm.isPremium)} onChange={e => setEditForm(f => ({...f, isPremium: e.target.value === 'true'}))}>
                  <option value="false">{tx.free}</option>
                  <option value="true">{tx.premium}</option>
                </select>
              </label>
              <label>
                <span>{tx.scanLimit}</span>
                <input type="number" min="0" value={editForm.scanLimit} onChange={e => setEditForm(f => ({...f, scanLimit: e.target.value}))} />
              </label>
              <label>
                <span>{tx.membershipLabel}</span>
                <input type="date" value={editForm.membershipExpires} onChange={e => setEditForm(f => ({...f, membershipExpires: e.target.value}))} />
              </label>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-secondary" onClick={() => setEditModal(null)}>{tx.cancel}</button>
              <button className="btn-primary" onClick={handleSaveEdit}>{tx.save}</button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {userDetailModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal-wide">
            <div className="admin-modal-header">
              <h3>{tx.userDetails}</h3>
              <button className="btn-icon" onClick={() => { setUserDetailModal(null); setUserDetail(null); }}><FiX /></button>
            </div>
            <div className="admin-modal-body">
              {userDetailLoading ? (
                <div className="admin-loading">{tx.loading}</div>
              ) : userDetail ? (
                <>
                  <div className="user-detail-grid">
                    <div className="user-detail-card">
                      <p><strong>{userDetail.user.username}</strong></p>
                      <p><small>{userDetail.user.email}</small></p>
                      <p>
                        <span className={`badge-sm ${userDetail.user.role === 'admin' ? 'badge-purple' : 'badge-gray'}`}>{userDetail.user.role}</span>{' '}
                        <span className={`badge-sm ${userDetail.user.isPremium ? 'badge-green' : 'badge-gray'}`}>{userDetail.user.isPremium ? 'Premium' : 'Free'}</span>
                      </p>
                      <p><strong>{tx.scanLimit}:</strong> {userDetail.user.scanLimit}</p>
                      <p><strong>{tx.expires}:</strong> {userDetail.user.membershipExpires ? formatDate(userDetail.user.membershipExpires) : tx.never}</p>
                      <p><strong>{tx.joined}:</strong> {formatDate(userDetail.user.createdAt)}</p>
                    </div>

                    <div className="user-history-section">
                      <h4>{tx.jobHistory}</h4>
                      {userDetail.jobScans?.length > 0 ? (
                        <table className="admin-table">
                          <thead><tr><th>Title</th><th>{tx.verdict}</th><th>{tx.score}</th></tr></thead>
                          <tbody>
                            {userDetail.jobScans.map(s => (
                              <tr key={s._id}>
                                <td><small>{s.scanTitle}</small></td>
                                <td><span className={`badge-sm ${verdictBadgeClass(s.analysis?.verdict)}`}>{s.analysis?.verdict}</span></td>
                                <td><strong>{s.analysis?.score ?? '—'}</strong></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : <p className="no-data">{tx.noHistory}</p>}

                      <h4>{tx.cvHistory}</h4>
                      {userDetail.cvScans?.length > 0 ? (
                        <table className="admin-table">
                          <thead><tr><th>File</th><th>Score</th><th>Status</th></tr></thead>
                          <tbody>
                            {userDetail.cvScans.map(c => (
                              <tr key={c._id}>
                                <td><small>{c.cvFileName}</small></td>
                                <td><strong>{c.analysis?.cvMatchScore ?? '—'}%</strong></td>
                                <td><span className="badge-sm badge-gray">{c.analysis?.matchStatus}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : <p className="no-data">{tx.noHistory}</p>}
                    </div>
                  </div>
                </>
              ) : <p className="no-data">{tx.noData}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal-sm">
            <div className="admin-modal-header">
              <h3><FiAlertTriangle style={{color:'#dc2626'}} /> {tx.delete}</h3>
            </div>
            <div className="admin-modal-body">
              <p>{tx.confirmDelete}</p>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>{tx.cancel}</button>
              <button className="btn-danger" onClick={handleDeleteUser}>{tx.delete}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
