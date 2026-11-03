import { useEffect, useMemo, useState } from "react";
import "./Employees.css";
import EmployeeFormModal from "../components/modals/EmployeeFormModal";

const API_URL = import.meta.env.VITE_API_URL;

function Employees() {
    const [employees, setEmployees] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [divisionFilter, setDivisionFilter] = useState("ALL");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const token = localStorage.getItem("access_token");

    const headers = {
        Authorization: `Bearer ${token}`,
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [employeeResponse, divisionResponse] = await Promise.all([
                fetch(`${API_URL}/employees`, { headers }),
                fetch(`${API_URL}/divisions`, { headers }),
            ]);

            if (
                employeeResponse.status === 401 ||
                divisionResponse.status === 401
            ) {
                localStorage.removeItem("access_token");
                window.location.href = "/login";
                return;
            }

            if (!employeeResponse.ok || !divisionResponse.ok) {
                throw new Error("Failed to retrieve employee data.");
            }

            const employeeResult = await employeeResponse.json();
            const divisionResult = await divisionResponse.json();

            const employeeData =
                employeeResult.data?.employees ??
                employeeResult.data ??
                [];

            const divisionData =
                divisionResult.data?.divisions ??
                divisionResult.data ??
                [];

            setEmployees(Array.isArray(employeeData) ? employeeData : []);
            setDivisions(Array.isArray(divisionData) ? divisionData : []);
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refreshKey]);

    const filteredEmployees = useMemo(() => {
        return employees.filter((employee) => {
            const searchTerm = search.toLowerCase();

            const matchesSearch =
                (employee.nama || "").toLowerCase().includes(searchTerm) ||
                (employee.nip || "").toLowerCase().includes(searchTerm) ||
                (employee.email || "").toLowerCase().includes(searchTerm);

            const matchesStatus =
                statusFilter === "ALL" ||
                employee.status === statusFilter;

            const matchesDivision =
                divisionFilter === "ALL" ||
                String(employee.division_id) === divisionFilter;

            return matchesSearch && matchesStatus && matchesDivision;
        });
    }, [employees, search, statusFilter, divisionFilter]);

    const activeCount = employees.filter(
        (employee) => employee.status === "ACTIVE"
    ).length;

    const inactiveCount = employees.filter(
        (employee) => employee.status === "INACTIVE"
    ).length;

    const handleDelete = async (employee) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${employee.nama}?`
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `${API_URL}/employees/${employee.id}`,
                {
                    method: "DELETE",
                    headers,
                }
            );

            const result = await response.json();

            if (response.status === 401) {
                localStorage.removeItem("access_token");
                window.location.href = "/login";
                return;
            }

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to delete employee."
                );
            }

            setRefreshKey((previous) => previous + 1);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setSelectedEmployee(null);
        setRefreshKey((previous) => previous + 1);
    };

    return (
        <div className="employees-page">
            <header className="employees-header">
                <div>
                    <p className="breadcrumb">WORKSPACE / EMPLOYEE MANAGEMENT</p>
                    <h1>Data Pegawai</h1>
                    <p className="header-subtitle">
                        Manage employee records across the organization.
                    </p>
                </div>

                <div className="employees-header-actions">
                    <button
                        type="button"
                        className="back-dashboard-button"
                        onClick={() => window.location.href = "/dashboard"}
                    >
                        ← Dashboard
                    </button>

                    <button
                        className="add-employee-button"
                        onClick={() => {
                            setSelectedEmployee(null);
                            setShowForm(true);
                        }}
                    >
                        + Add Employee
                    </button>
                </div>
            </header>

            <section className="employee-metrics">
                <article className="employee-metric">
                    <span>TOTAL EMPLOYEES</span>
                    <strong>{employees.length}</strong>
                </article>

                <article className="employee-metric">
                    <span>ACTIVE EMPLOYEES</span>
                    <strong>{activeCount}</strong>
                </article>

                <article className="employee-metric">
                    <span>INACTIVE EMPLOYEES</span>
                    <strong>{inactiveCount}</strong>
                </article>
            </section>

            <section className="employee-directory">
                <div className="directory-heading">
                    <div>
                        <span className="eyebrow">EMPLOYEE RECORDS</span>
                        <h2>Employee Directory</h2>
                    </div>

                    <span className="request-count">
                        {filteredEmployees.length} RECORDS
                    </span>
                </div>

                <div className="employee-filters">
                    <input
                        type="search"
                        placeholder="Search by NIP, name, or email..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />

                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>

                    <select
                        value={divisionFilter}
                        onChange={(event) =>
                            setDivisionFilter(event.target.value)
                        }
                    >
                        <option value="ALL">All Divisions</option>
                        {divisions.map((division) => (
                            <option key={division.id} value={String(division.id)}>
                                {division.name}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <p className="employee-message">Loading employees...</p>
                ) : error ? (
                    <div className="employee-message employee-error">
                        {error}
                        <button onClick={() => setRefreshKey((key) => key + 1)}>
                            Retry
                        </button>
                    </div>
                ) : filteredEmployees.length === 0 ? (
                    <p className="employee-message">
                        No employee records found.
                    </p>
                ) : (
                    <div className="employee-table-wrapper">
                        <table className="employee-table">
                            <thead>
                            <tr>
                                <th>EMPLOYEE</th>
                                <th>NIP</th>
                                <th>EMAIL</th>
                                <th>DIVISION</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filteredEmployees.map((employee) => (
                                <tr key={employee.id}>
                                    <td>
                                        <strong>{employee.nama}</strong>
                                    </td>
                                    <td>{employee.nip}</td>
                                    <td>{employee.email}</td>
                                    <td>
                                        {employee.division_name || "—"}
                                    </td>
                                    <td>
                                            <span
                                                className={`employee-status ${employee.status.toLowerCase()}`}
                                            >
                                                {employee.status}
                                            </span>
                                    </td>
                                    <td>
                                        <div className="employee-actions">
                                            <button
                                                className="edit-employee-button"
                                                onClick={() => {
                                                    setSelectedEmployee(employee);
                                                    setShowForm(true);
                                                }}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="delete-employee-button"
                                                onClick={() =>
                                                    handleDelete(employee)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {showForm && (
                <EmployeeFormModal
                    employee={selectedEmployee}
                    divisions={divisions}
                    onClose={() => {
                        setShowForm(false);
                        setSelectedEmployee(null);
                    }}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
}

export default Employees;
