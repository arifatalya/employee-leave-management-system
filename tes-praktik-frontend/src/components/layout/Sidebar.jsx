import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ user }) {
    const navigate = useNavigate();

    const role = user?.role;

    const roleLabels = {
        ADMIN: "Administrator",
        STAFF: "Staff Member",
        DIVISION_HEAD: "Division Head",
    };

    const navigation = [
        { label: "Dashboard", path: "/dashboard", icon: "▦" },
        ...(role === "ADMIN"
            ? [{ label: "Data Pegawai", path: "/employees", icon: "▤" }]
            : []),
    ];

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        navigate("/login");
    };

    return (
        <aside className="app-sidebar">
            <div className="sidebar-brand">
                <div className="brand-logo">EL</div>
                <div>
                    <h2>ELMS</h2>
                    <span>EMPLOYEE PORTAL</span>
                </div>
            </div>

            <div className="sidebar-navigation">
                <span className="sidebar-section-label">WORKSPACE</span>

                {navigation.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? "active" : ""}`
                        }
                    >
                        <span className="sidebar-link-icon">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </div>

            <div className="sidebar-account">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">
                        {user?.name?.charAt(0) || "U"}
                    </div>

                    <div className="sidebar-user-info">
                        <strong>{user?.name || "User"}</strong>
                        <span>{roleLabels[role] || role}</span>
                    </div>
                </div>

                <button
                    type="button"
                    className="sidebar-logout"
                    onClick={handleLogout}
                >
                    ↪ Sign out
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
