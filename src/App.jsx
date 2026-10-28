import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaBriefcase,
  FaUsers,
  FaTrash,
  FaEye,
  FaSignOutAlt,
  FaLock,
  FaChartBar,
  FaHistory,
  FaBan,
  FaCheckCircle,
  FaBuilding,
  FaSearch,
  FaCopy,
  FaCheck,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaTag,
  FaClock,
} from "react-icons/fa";
import { API_BASE_URL, adminFetch } from "./api";

/* ── LOGIN COMPONENT ──────────────────────────────────────────────────────────── */
const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid admin credentials");
      }

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_info", JSON.stringify(data.admin));
      onLoginSuccess(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full border border-slate-800/10">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 text-2xl shadow-lg shadow-blue-500/30">
          <FaLock />
        </div>
        <h2 className="text-2xl font-black text-center text-slate-900 mb-1">
          Admin Operations
        </h2>
        <p className="text-xs text-slate-500 text-center mb-6">
          Sign in to access platform management and security controls
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="admin@jobplatform.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 text-xs shadow-md shadow-blue-500/20"
          >
            {loading ? "Authenticating..." : "Sign In to Operations"}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ── SIDEBAR NAVIGATION ────────────────────────────────────────────────────────── */
const Sidebar = ({ view, setView, onLogout }) => {
  const navItems = [
    { key: "overview", label: "Dashboard Overview", icon: FaChartBar },
    { key: "jobs", label: "Job Vacancies", icon: FaBriefcase },
    { key: "users", label: "Candidate Users", icon: FaUsers },
    { key: "companies", label: "Employer Partners", icon: FaBuilding },
    { key: "audit", label: "System Audit Logs", icon: FaHistory },
  ];

  return (
    <aside className="w-64 h-screen bg-slate-900 text-white p-5 flex flex-col justify-between fixed left-0 top-0 border-r border-slate-800 z-30">
      <div className="flex flex-col gap-2">
        <div className="border-b border-slate-800 pb-5 mb-3 pt-2">
          <div className="flex items-center gap-2.5">
            <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-lg font-black tracking-wider">
              GP
            </span>
            <div>
              <h1 className="text-base font-black text-white tracking-tight leading-none">
                GetPlaced
              </h1>
              <span className="text-2xs text-slate-400 font-semibold tracking-wider uppercase">
                Enterprise Admin
              </span>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  active
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition text-xs font-semibold"
        >
          <FaSignOutAlt size={14} />
          <span>Exit Session</span>
        </button>
      </div>
    </aside>
  );
};

/* ── STRUCTURED RESOURCE DETAILS MODAL (REPLACES RAW JSON) ───────────────────── */
const ResourceDetailModal = ({ item, view, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  if (!item) return null;

  const copyId = () => {
    navigator.clipboard.writeText(item._id || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const title = item.title || item.name || item.fullname || item.action || "Resource Record";
  const status = item.accountStatus || item.status || "active";

  const getStatusBadge = (st) => {
    const isGood = ["active", "published"].includes(st);
    const isBad = ["suspended", "closed", "rejected"].includes(st);
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase border ${
          isGood
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : isBad
            ? "bg-rose-50 text-rose-700 border-rose-200"
            : "bg-slate-100 text-slate-700 border-slate-200"
        }`}
      >
        {st}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-100">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-bold text-slate-900">{title}</h3>
              {getStatusBadge(status)}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-mono">
              <span>ID: {item._id}</span>
              <button
                onClick={copyId}
                className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 text-2xs font-sans font-bold"
                title="Copy ID"
              >
                {copied ? <FaCheck className="text-emerald-500" /> : <FaCopy />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 rounded-lg hover:bg-slate-100 transition"
          >
            &times;
          </button>
        </div>

        {/* Modal Content Formatted Grid */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* General Information Table */}
          <div>
            <h4 className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Entity Attributes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              {item.email && (
                <div className="flex items-center gap-2 text-slate-700">
                  <FaEnvelope className="text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-500">Email:</span>
                  <span className="font-medium text-slate-900 truncate">{item.email}</span>
                </div>
              )}

              {item.phone && (
                <div className="flex items-center gap-2 text-slate-700">
                  <FaPhone className="text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-500">Phone:</span>
                  <span className="font-medium text-slate-900">{item.phone}</span>
                </div>
              )}

              {item.role && (
                <div className="flex items-center gap-2 text-slate-700">
                  <FaBriefcase className="text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-500">Role:</span>
                  <span className="font-medium text-slate-900">{item.role}</span>
                </div>
              )}

              {item.jobType && (
                <div className="flex items-center gap-2 text-slate-700">
                  <FaClock className="text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-500">Job Type:</span>
                  <span className="font-medium text-slate-900">{item.jobType}</span>
                </div>
              )}

              {item.salary && (
                <div className="flex items-center gap-2 text-slate-700">
                  <FaMoneyBillWave className="text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-500">Salary:</span>
                  <span className="font-bold text-emerald-600">
                    ${Number(item.salary).toLocaleString()}
                  </span>
                </div>
              )}

              {item.experience && (
                <div className="flex items-center gap-2 text-slate-700">
                  <FaTag className="text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-500">Experience:</span>
                  <span className="font-medium text-slate-900 capitalize">{item.experience}</span>
                </div>
              )}

              {(item.location || item.city) && (
                <div className="flex items-center gap-2 text-slate-700">
                  <FaMapMarkerAlt className="text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-500">Location:</span>
                  <span className="font-medium text-slate-900 capitalize">
                    {item.location || `${item.city || ""}, ${item.state || ""}`}
                  </span>
                </div>
              )}

              {item.company?.name && (
                <div className="flex items-center gap-2 text-slate-700">
                  <FaBuilding className="text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-500">Company:</span>
                  <span className="font-medium text-slate-900">{item.company.name}</span>
                </div>
              )}

              {item.companySize && (
                <div className="flex items-center gap-2 text-slate-700">
                  <FaUsers className="text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-500">Size:</span>
                  <span className="font-medium text-slate-900">{item.companySize} employees</span>
                </div>
              )}

              {item.education && (
                <div className="flex items-center gap-2 text-slate-700">
                  <FaTag className="text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-500">Education:</span>
                  <span className="font-medium text-slate-900 capitalize">{item.education}</span>
                </div>
              )}

              {item.createdAt && (
                <div className="flex items-center gap-2 text-slate-700">
                  <FaCalendarAlt className="text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-500">Created:</span>
                  <span className="font-mono text-slate-600">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description or Bio */}
          {(item.description || item.slogan) && (
            <div>
              <h4 className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Overview & Description
              </h4>
              <p className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 leading-relaxed">
                {item.description || item.slogan}
              </p>
            </div>
          )}

          {/* Skills Badges */}
          {Array.isArray(item.skills) && item.skills.length > 0 && (
            <div>
              <h4 className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Tagged Skills ({item.skills.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {item.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-2xs font-bold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Audit Log Specific View */}
          {view === "audit" && (
            <div>
              <h4 className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Security & Audit Context
              </h4>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-700">Action:</span>{" "}
                  <code className="text-blue-600 font-mono font-bold">{item.action}</code>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Actor:</span>{" "}
                  <span>{item.actorRole} ({item.actorId})</span>
                </div>
                {item.ipAddress && (
                  <div>
                    <span className="font-bold text-slate-700">IP Address:</span>{" "}
                    <code className="font-mono text-slate-600">{item.ipAddress}</code>
                  </div>
                )}
                {item.details && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="font-bold text-slate-700 block mb-1">Details:</span>
                    <pre className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-2xs font-mono overflow-x-auto">
                      {JSON.stringify(item.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Collapsible Developer Schema (Raw JSON toggle) */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowRawJson(!showRawJson)}
              className="text-2xs text-slate-500 hover:text-slate-800 font-semibold transition flex items-center gap-1"
            >
              <span>{showRawJson ? "▼ Hide" : "▶ Show"} Raw MongoDB Record</span>
            </button>
            {showRawJson && (
              <pre className="mt-2 text-2xs bg-slate-900 text-emerald-400 p-4 rounded-xl overflow-auto font-mono max-h-48">
                {JSON.stringify(item, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── MAIN ADMIN APP COMPONENT ─────────────────────────────────────────────────── */
const App = () => {
  const [token, setToken] = useState(localStorage.getItem("admin_token"));
  const [view, setView] = useState("overview"); // overview, jobs, users, companies, audit
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminFetch("/admin/stats");
      if (res.ok) {
        const s = await res.json();
        setStats(s);
      }
    } catch {
      // Non-blocking
    }
  }, []);

  const fetchData = useCallback(
    async (currentView) => {
      if (!token) return;
      setLoading(true);
      setSearchQuery("");
      try {
        if (currentView === "overview") {
          await fetchStats();
        } else if (currentView === "audit") {
          const res = await adminFetch("/audit?limit=100");
          if (res.ok) {
            const result = await res.json();
            setAuditLogs(result.logs || []);
          }
        } else {
          const res = await adminFetch(`/${currentView}`);
          if (!res.ok) throw new Error(`Failed to load ${currentView}`);
          const result = await res.json();
          setData(Array.isArray(result) ? result : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [token, fetchStats]
  );

  useEffect(() => {
    if (token) {
      fetchData(view);
    }
  }, [token, view, fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this resource?")) return;
    try {
      const res = await adminFetch(`/${view}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setData((prev) => prev.filter((item) => item._id !== id));
      } else {
        alert("Failed to delete resource");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting resource");
    }
  };

  const handleToggleAccountStatus = async (type, id, currentStatus) => {
    const newStatus = currentStatus === "suspended" ? "active" : "suspended";
    try {
      const res = await adminFetch(`/admin/${type}/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setData((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, accountStatus: newStatus } : item
          )
        );
      } else {
        alert("Failed to update account status");
      }
    } catch {
      alert("Network error updating status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_info");
    setToken(null);
  };

  // Filtered lists based on search bar
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((item) => {
      const str = `${item.title || ""} ${item.name || ""} ${item.fullname || ""} ${item.email || ""} ${item.role || ""} ${item.location || ""}`.toLowerCase();
      return str.includes(q);
    });
  }, [data, searchQuery]);

  const filteredAuditLogs = useMemo(() => {
    if (!searchQuery.trim()) return auditLogs;
    const q = searchQuery.toLowerCase();
    return auditLogs.filter((log) => {
      const str = `${log.action || ""} ${log.actorRole || ""} ${log.entity || ""} ${log.entityId || ""}`.toLowerCase();
      return str.includes(q);
    });
  }, [auditLogs, searchQuery]);

  if (!token) {
    return <AdminLogin onLoginSuccess={(newToken) => setToken(newToken)} />;
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar view={view} setView={setView} onLogout={handleLogout} />

      <main className="ml-64 flex-1 p-8">
        {/* Top Operational Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-4 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-blue-600 block">
              Platform Console
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 capitalize">
              {view === "overview"
                ? "Platform Dashboard Overview"
                : view === "audit"
                ? "Security & Compliance Audit Trail"
                : `${view} Management`}
            </h1>
          </div>

          {view !== "overview" && (
            <div className="relative w-full sm:w-72">
              <FaSearch className="absolute left-3.5 top-3 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder={`Search ${view}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          )}
        </div>

        {/* VIEW 1: OVERVIEW DASHBOARD */}
        {view === "overview" && (
          <div className="space-y-8">
            {loading || !stats ? (
              <div className="p-16 text-center text-slate-400">Loading platform metrics...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
                      Total Candidates
                    </span>
                    <p className="text-3xl font-black text-slate-900 mt-2">
                      {stats.totalUsers}
                    </p>
                    <span className="text-xs text-blue-600 font-semibold mt-1 block">
                      Registered Job Seekers
                    </span>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
                      Employer Partners
                    </span>
                    <p className="text-3xl font-black text-slate-900 mt-2">
                      {stats.totalCompanies}
                    </p>
                    <span className="text-xs text-emerald-600 font-semibold mt-1 block">
                      Active Organizations
                    </span>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
                      Job Vacancies
                    </span>
                    <p className="text-3xl font-black text-slate-900 mt-2">
                      {stats.publishedJobs}{" "}
                      <span className="text-xs text-slate-400 font-medium">
                        / {stats.totalJobs} total
                      </span>
                    </p>
                    <span className="text-xs text-indigo-600 font-semibold mt-1 block">
                      Published Opportunities
                    </span>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
                      Pipeline Submissions
                    </span>
                    <p className="text-3xl font-black text-slate-900 mt-2">
                      {stats.totalApplications}
                    </p>
                    <span className="text-xs text-purple-600 font-semibold mt-1 block">
                      {stats.totalOffers} Offers Extended
                    </span>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">
                    Administrative Quick Links
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setView("jobs")}
                      className="p-4 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-xl text-left transition"
                    >
                      <FaBriefcase className="text-blue-600 text-lg mb-1" />
                      <h4 className="text-xs font-bold text-slate-900">Moderate Jobs</h4>
                      <p className="text-2xs text-slate-500 mt-0.5">
                        Inspect drafts, published postings, and salary specs.
                      </p>
                    </button>

                    <button
                      onClick={() => setView("users")}
                      className="p-4 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-xl text-left transition"
                    >
                      <FaUsers className="text-emerald-600 text-lg mb-1" />
                      <h4 className="text-xs font-bold text-slate-900">Manage Candidates</h4>
                      <p className="text-2xs text-slate-500 mt-0.5">
                        Toggle account status, review details, manage access.
                      </p>
                    </button>

                    <button
                      onClick={() => setView("audit")}
                      className="p-4 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-xl text-left transition"
                    >
                      <FaHistory className="text-purple-600 text-lg mb-1" />
                      <h4 className="text-xs font-bold text-slate-900">Compliance Audit</h4>
                      <p className="text-2xs text-slate-500 mt-0.5">
                        Inspect timestamped logs and security events.
                      </p>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* VIEW 2: AUDIT LOGS TABLE */}
        {view === "audit" && (
          <div className="bg-white shadow-xs rounded-2xl overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <span className="text-xs font-bold text-slate-700">
                Audit Trail Events ({filteredAuditLogs.length})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="p-3.5 font-bold uppercase text-2xs">Timestamp</th>
                    <th className="p-3.5 font-bold uppercase text-2xs">Actor</th>
                    <th className="p-3.5 font-bold uppercase text-2xs">Action</th>
                    <th className="p-3.5 font-bold uppercase text-2xs">Entity Target</th>
                    <th className="p-3.5 font-bold uppercase text-2xs text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No audit events match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3.5 text-slate-500 font-mono text-2xs">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-800">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-2xs uppercase font-bold">
                            {log.actorRole}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded font-mono font-bold bg-blue-50 text-blue-700 text-2xs">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-slate-700">
                          {log.entity} <span className="text-slate-400 font-mono">({log.entityId?.slice(-6) || "—"})</span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSelectedItem(log)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Inspect structured event"
                          >
                            <FaEye size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: ENTITY TABLES (Jobs, Users, Companies) */}
        {!["overview", "audit"].includes(view) && (
          <div className="bg-white shadow-xs rounded-2xl overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <span className="text-xs font-bold text-slate-700">
                {view.toUpperCase()} ({filteredData.length} total)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="p-3.5 font-bold uppercase text-2xs">Resource Title / Name</th>
                    <th className="p-3.5 font-bold uppercase text-2xs">Details / Contact</th>
                    <th className="p-3.5 font-bold uppercase text-2xs">Status</th>
                    <th className="p-3.5 font-bold uppercase text-2xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">
                        Loading {view}...
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">
                        No {view} found matching &ldquo;{searchQuery}&rdquo;.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => {
                      const itemTitle = item.title || item.name || item.fullname || "Unnamed";
                      const itemSubtitle = item.email || item.role || item.location || "—";
                      const itemStatus = item.accountStatus || item.status || "active";

                      return (
                        <tr key={item._id} className="hover:bg-slate-50/70 transition">
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{itemTitle}</div>
                            <span className="text-2xs text-slate-400 font-mono">
                              ID: {item._id}
                            </span>
                          </td>

                          <td className="p-3.5 text-slate-600">{itemSubtitle}</td>

                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-2xs font-bold uppercase border ${
                                itemStatus === "suspended"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : itemStatus === "published"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              {itemStatus}
                            </span>
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex gap-1.5 justify-end items-center">
                              {["users", "companies"].includes(view) && (
                                <button
                                  onClick={() =>
                                    handleToggleAccountStatus(view, item._id, item.accountStatus)
                                  }
                                  className={`p-1.5 rounded-lg transition ${
                                    item.accountStatus === "suspended"
                                      ? "text-emerald-600 hover:bg-emerald-50"
                                      : "text-amber-600 hover:bg-amber-50"
                                  }`}
                                  title={
                                    item.accountStatus === "suspended"
                                      ? "Activate Account"
                                      : "Suspend Account"
                                  }
                                >
                                  {item.accountStatus === "suspended" ? (
                                    <FaCheckCircle size={14} />
                                  ) : (
                                    <FaBan size={14} />
                                  )}
                                </button>
                              )}

                              <button
                                onClick={() => setSelectedItem(item)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Inspect Formatted Record"
                              >
                                <FaEye size={14} />
                              </button>

                              <button
                                onClick={() => handleDelete(item._id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete Resource"
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* STRUCTURED RECORD INSPECTOR WINDOW (REPLACES RAW JSON DUMP) */}
      <ResourceDetailModal
        item={selectedItem}
        view={view}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};

export default App;
