import { useState } from "react";
import "./Modal.css";

const API_URL = import.meta.env.VITE_API_URL;

function EmployeeFormModal({ employee, divisions, onClose, onSuccess }) {
    const isEditing = Boolean(employee);

    const [formData, setFormData] = useState({
        nip: employee?.nip || "",
        nama: employee?.nama || "",
        email: employee?.email || "",
        alamat: employee?.alamat || "",
        division_id: employee?.division_id
            ? String(employee.division_id)
            : "",
        status: employee?.status || "ACTIVE",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.nip.trim() && !isEditing) {
            setError("NIP is required.");
            return;
        }

        if (!formData.nama.trim() || !formData.email.trim()) {
            setError("Employee name and email are required.");
            return;
        }

        if (!formData.division_id) {
            setError("Please select a division.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("access_token");

            const payload = {
                nama: formData.nama.trim(),
                email: formData.email.trim(),
                alamat: formData.alamat.trim() || null,
                division_id: Number(formData.division_id),
            };

            if (!isEditing) {
                payload.nip = formData.nip.trim();
                payload.status = formData.status;
            } else {
                payload.status = formData.status;
            }

            const response = await fetch(
                `${API_URL}/employees${isEditing ? `/${employee.id}` : ""}`,
                {
                    method: isEditing ? "PUT" : "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
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
                    result.message || "Unable to save employee."
                );
            }

            onSuccess?.();
        } catch (err) {
            setError(
                err.message === "Failed to fetch"
                    ? "Unable to connect to the server."
                    : err.message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="modal-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !loading) {
                    onClose();
                }
            }}
        >
            <section
                className="modal-container"
                role="dialog"
                aria-modal="true"
            >
                <header className="modal-header">
                    <div>
                        <span className="modal-eyebrow">EMPLOYEE MANAGEMENT</span>
                        <h2>{isEditing ? "Edit Employee" : "Add Employee"}</h2>
                        <p>
                            {isEditing
                                ? "Update the employee's information."
                                : "Enter the information to register a new employee."}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="modal-close-button"
                        onClick={onClose}
                        disabled={loading}
                    >
                        ×
                    </button>
                </header>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body employee-form">
                        <div className="modal-field">
                            <label htmlFor="employee-nip">NIP</label>
                            <input
                                id="employee-nip"
                                name="nip"
                                value={formData.nip}
                                onChange={handleChange}
                                disabled={isEditing || loading}
                                required={!isEditing}
                                placeholder="Enter employee NIP"
                            />
                            {isEditing && (
                                <small>NIP cannot be changed.</small>
                            )}
                        </div>

                        <div className="modal-field">
                            <label htmlFor="employee-name">Employee Name</label>
                            <input
                                id="employee-name"
                                name="nama"
                                value={formData.nama}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                placeholder="Enter employee name"
                            />
                        </div>

                        <div className="modal-field">
                            <label htmlFor="employee-email">Email</label>
                            <input
                                id="employee-email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                placeholder="name@company.com"
                            />
                        </div>

                        <div className="modal-field">
                            <label htmlFor="employee-division">Division</label>
                            <select
                                id="employee-division"
                                name="division_id"
                                value={formData.division_id}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            >
                                <option value="">Select division</option>
                                {divisions
                                    .filter((division) => division.status === "ACTIVE")
                                    .map((division) => (
                                        <option
                                            key={division.id}
                                            value={String(division.id)}
                                        >
                                            {division.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="modal-field">
                            <label htmlFor="employee-address">Address</label>
                            <textarea
                                id="employee-address"
                                name="alamat"
                                value={formData.alamat}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="Enter employee address"
                                rows={3}
                            />
                        </div>

                        {isEditing && (
                            <div className="modal-field">
                                <label htmlFor="employee-status">Status</label>
                                <select
                                    id="employee-status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                        )}

                        {error && (
                            <div className="modal-error" role="alert">
                                {error}
                            </div>
                        )}
                    </div>

                    <footer className="modal-footer">
                        <button
                            type="button"
                            className="modal-secondary-button"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="modal-primary-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Saving..."
                                : isEditing
                                    ? "Save Changes"
                                    : "Add Employee"}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}

export default EmployeeFormModal;
