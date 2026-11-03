import { useEffect, useState } from "react";
import "./Dashboard.css";
import CreateLeaveModal from "../components/modals/CreateLeaveModal";
import LeaveDecisionModal from "../components/modals/LeaveDecisionModal";

const API_URL = import.meta.env.VITE_API_URL;

function Dashboard() {
    const [user, setUser] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [requests, setRequests] = useState([]);
    const [selectedDecision, setSelectedDecision] = useState(null);


    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem("access_token");

                if (!token) {
                    window.location.href = "/login";
                    return;
                }

                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                const [userResponse, summaryResponse, requestsResponse] =
                    await Promise.all([
                        fetch(`${API_URL}/auth/me`, { headers }),
                        fetch(`${API_URL}/dashboard/summary`, { headers }),
                        fetch(`${API_URL}/leave-requests`, { headers }),
                    ]);

                if (
                    userResponse.status === 401 ||
                    summaryResponse.status === 401 ||
                    requestsResponse.status === 401
                ) {
                    localStorage.removeItem("access_token");
                    window.location.href = "/login";
                    return;
                }

                if (
                    !userResponse.ok ||
                    !summaryResponse.ok ||
                    !requestsResponse.ok
                ) {
                    throw new Error("Failed to load dashboard data.");
                }

                const userResult = await userResponse.json();
                const summaryResult = await summaryResponse.json();
                const requestsResult = await requestsResponse.json();

                setUser(userResult.data.user);
                setSummary(summaryResult.data);
                setRequests(requestsResult.data.leave_requests || []);

            } catch (err) {
                setError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);


    const handleLogout = () => {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner" />
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <h2>Unable to load dashboard</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>
                    Try again
                </button>
            </div>
        );
    }

    if (!user || !summary) return null;

    const roleLabels = {
        ADMIN: "Administrator",
        DIVISION_HEAD: "Division Head",
        STAFF: "Staff Member",
    };

    const isStaff = user.role === "STAFF";
    const isAdmin = user.role === "ADMIN";
    const isDivisionHead = user.role === "DIVISION_HEAD";

    const employeeMetrics = [
        {
            label: "Total Employees",
            value: summary.totalEmployees,
            description: "Registered employees",
        },
        {
            label: "Active Employees",
            value: summary.activeEmployees,
            description: "Currently active",
        },
        {
            label: "Inactive Employees",
            value: summary.inactiveEmployees,
            description: "Currently inactive",
        },
    ];

    const leaveMetrics = [
        {
            label: "Pending Requests",
            value: summary.pendingLeaveRequests,
            description: isStaff ? "Awaiting review" : "Awaiting approval",
            color: "yellow",
        },
        {
            label: "Approved This Month",
            value: summary.approvedThisMonth,
            description: "Current calendar month",
            color: "green",
        },
        {
            label: "Rejected This Month",
            value: summary.rejectedThisMonth,
            description: "Current calendar month",
            color: "red",
        },
    ];

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "Asia/Jakarta",
        });
    };

    const scrollToLeaveRequests = () => {
        document.getElementById("leave-requests")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    const formatLeavePeriod = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const options = {
            day: "2-digit",
            month: "short",
            timeZone: "Asia/Jakarta",
        };

        const startDay = start.toLocaleDateString("en-GB", options);
        const endDay = end.toLocaleDateString("en-GB", options);

        const year = end.toLocaleDateString("en-GB", {
            year: "numeric",
            timeZone: "Asia/Jakarta",
        });

        return `${startDay}–${endDay} ${year}`;
    };

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <div className="sidebar-brand">
                    <div className="brand-mark">EL</div>
                    <div>
                        <h2>ELMS</h2>
                        <span>EMPLOYEE PORTAL</span>
                    </div>
                </div>

                <div className="sidebar-section">
                    <p className="sidebar-heading">WORKSPACE</p>

                    <a href="/dashboard" className="sidebar-link active">
                        <span className="sidebar-icon">▦</span>
                        Dashboard
                    </a>

                    {isAdmin && (
                        <>
                            <a href="/employees" className="sidebar-link">
                                <span className="sidebar-icon">▤</span>
                                Data Pegawai
                            </a>
                        </>
                    )}

                    {isStaff && (
                        <button type="button" className="sidebar-link" onClick={scrollToLeaveRequests}>
                            <span className="sidebar-icon">▧</span>
                            Pengajuan Cuti Saya
                        </button>
                    )}

                    {isDivisionHead && (
                        <button type="button" className="sidebar-link" onClick={scrollToLeaveRequests}>
                            <span className="sidebar-icon">☷</span>
                            Approval Cuti
                        </button>
                    )}
                </div>

                <div className="sidebar-bottom">
                    <div className="sidebar-user">
                        <div className="user-avatar">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="user-details">
                            <strong>{user.name}</strong>
                            <span>{roleLabels[user.role] || user.role}</span>
                        </div>
                    </div>

                    <button className="logout-button" onClick={handleLogout}>
                        <span>↪</span> Sign out
                    </button>
                </div>
            </aside>

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div>
                        <p className="breadcrumb">WORKSPACE / OVERVIEW</p>
                        <h1>Dashboard</h1>
                        <p className="header-subtitle">
                            Welcome back, {user.name}.
                        </p>
                    </div>

                    <div className="header-date">
                        <span className="date-indicator" />
                        <span>{new Date().toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })}</span>
                    </div>
                </header>

                <section className="welcome-panel">
                    <div>
                        <span className="eyebrow">EMPLOYEE LEAVE MANAGEMENT SYSTEM</span>
                        <h2>
                            {isAdmin
                                ? "Company Overview"
                                : isDivisionHead
                                    ? "Division Overview"
                                    : "Your Leave Overview"}
                        </h2>
                        <p>
                            {isAdmin
                                ? "Monitor employee records and leave activity across the organization."
                                : isDivisionHead
                                    ? "Review your division's workforce and leave request activity."
                                    : "Keep track of your leave requests and application status."}
                        </p>
                    </div>

                    <div className="welcome-role">
                        <div className="welcome-role-item">
                            <span>POSITION</span>
                            <strong>{roleLabels[user.role] || user.role}</strong>
                        </div>

                        <div className="welcome-role-item">
                            <span>DIVISION</span>
                            <strong>{user.division_name || "Not assigned"}</strong>
                        </div>
                    </div>
                </section>

                {!isStaff && (
                    <section className="dashboard-section">
                        <div className="section-heading">
                            <div>
                                <span className="eyebrow">01 / WORKFORCE</span>
                                <h2>Employee Statistics</h2>
                            </div>
                            {isAdmin && (
                                <a href="/employees" className="section-link">
                                    View employees <span>↗</span>
                                </a>
                            )}
                        </div>

                        <div className="metrics-grid">
                            {employeeMetrics.map((metric, index) => (
                                <MetricCard
                                    key={metric.label}
                                    metric={metric}
                                    index={index + 1}
                                />
                            ))}
                        </div>
                    </section>
                )}
                <section className="dashboard-section" id="leave-requests">
                    <div className="section-heading">
                        <div>
                            <span className="eyebrow">
                                02 / {isStaff ? "MY ACTIVITY" : "REQUEST ACTIVITY"}
                            </span>
                            <h2>
                                {isStaff ? "My Leave Requests" : "Recent Leave Requests"}
                            </h2>
                        </div>
                        <span className="request-count">{requests.length} RECORDS</span>
                    </div>

                    <div className="leave-table-section">
                        {requests.length === 0 ? (
                            <p className="table-message">
                                No leave requests found.
                            </p>
                        ) : (
                            <div className="leave-table-wrapper">
                                <table className="leave-table">
                                    <thead>
                                    <tr>
                                        {!isStaff && <th>EMPLOYEE</th>}
                                        <th>PERIOD</th>
                                        <th>DURATION</th>
                                        <th>REASON</th>
                                        <th>SUBMITTED</th>
                                        <th>STATUS</th>
                                        {isDivisionHead && <th>ACTION</th>}
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {requests.map((request) => (
                                        <tr key={request.id}>
                                            {!isStaff && (
                                                <td>
                                                    <strong>{request.employee_name}</strong>
                                                    <span className="employee-nip">{request.nip}</span>
                                                </td>
                                            )}
                                            <td className="leave-period">
                                                {formatLeavePeriod(request.start_date, request.end_date)}
                                            </td>

                                            <td>
                                                <strong>
                                                    {request.total_days} {request.total_days === 1 ? "day" : "days"}
                                                </strong>
                                            </td>

                                            <td>{request.reason}</td>

                                            <td>{formatDate(request.created_at)}</td>

                                            <td>
                                                <span className={`leave-status ${request.status.toLowerCase()}`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                            {isDivisionHead && (
                                                <td>
                                                    {request.status === "PENDING" ? (
                                                        <div className="approval-actions">
                                                            <button type="button" className="review-button approve" onClick={() =>
                                                                    setSelectedDecision({request, action: "approve",})}>
                                                                Approve
                                                            </button>
                                                            <button type="button" className="review-button reject" onClick={() =>
                                                                    setSelectedDecision({request, action: "reject",})}>
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="no-action">Processed</span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>

                <section className="dashboard-bottom">
                    <div className="information-panel">
                        <span className="eyebrow">SYSTEM INFORMATION</span>
                        <h3>Leave Management</h3>
                        <p>
                            {isAdmin
                                ? "You have organization-wide access to employee records and leave statistics. Leave approval decisions are handled by Division Heads."
                                : isDivisionHead
                                    ? "You are responsible for reviewing leave requests submitted by staff members in your division."
                                    : "You can submit new leave requests and monitor their approval status from your personal leave page."}
                        </p>
                    </div>

                    <div className="quick-action-panel">
                        <span className="eyebrow">QUICK ACCESS</span>

                        {isAdmin && (
                            <>
                                <h3>Employee Records</h3>
                                <a href="/employees" className="action-link">
                                    Manage employees <span>↗</span>
                                </a>
                            </>
                        )}

                        {isDivisionHead && (
                            <>
                                <h3>Leave Approvals</h3>
                                <button type="button" className="action-link" onClick={scrollToLeaveRequests}>
                                    Review leave requests <span>↗</span>
                                </button>
                            </>
                        )}

                        {isStaff && (
                            <>
                                <h3>Need time off?</h3>
                                <button type="button" className="action-link" onClick={() => setShowCreateModal(true)}>
                                    Submit a leave request <span>↗</span>
                                </button>
                            </>
                        )}
                    </div>
                </section>

                <footer className="dashboard-footer">
                    <span>ELMS · EMPLOYEE LEAVE MANAGEMENT SYSTEM</span>
                    <span>INTERNAL MANAGEMENT PORTAL</span>
                </footer>
            </main>

            {showCreateModal && (
                <CreateLeaveModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        window.location.reload();
                    }}
                />
            )}
            {selectedDecision && (
                <LeaveDecisionModal
                    request={selectedDecision.request}
                    action={selectedDecision.action}
                    onClose={() => setSelectedDecision(null)}
                    onSuccess={() => {
                        setSelectedDecision(null);
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}

function MetricCard({ metric, index }) {
    const value = metric.value ?? "—";

    return (
        <article className={`metric-card ${metric.color || ""}`}>
            <div className="metric-card-top">
        <span className="metric-index">
          {String(index).padStart(2, "0")}
        </span>
                <span className={`metric-indicator ${metric.color || ""}`} />
            </div>

            <div className="metric-card-content">
                <span className="metric-label">{metric.label}</span>
                <strong className="metric-value">{value}</strong>
                <span className="metric-description">{metric.description}</span>
            </div>
        </article>
    );
}

export default Dashboard;
