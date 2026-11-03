import { useState } from "react";
import "./Modal.css";

const API_URL = import.meta.env.VITE_API_URL;

function CreateLeaveModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        start_date: "",
        end_date: "",
        reason: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (formData.end_date < formData.start_date) {
            setError("End date cannot be earlier than start date.");
            return;
        }

        if (!formData.reason.trim()) {
            setError("Please provide a reason for your leave request.");
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem("access_token");

            const response = await fetch(`${API_URL}/leave-requests`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    reason: formData.reason.trim(),
                }),
            });

            const result = await response.json();

            if (response.status === 401) {
                localStorage.removeItem("access_token");
                window.location.href = "/login";
                return;
            }

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to submit your leave request."
                );
            }

            onSuccess?.(result.data);
            onClose();
        } catch (err) {
            setError(
                err.message === "Failed to fetch"
                    ? "Unable to connect to the server. Please try again."
                    : err.message
            );
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget && !loading) {
            onClose();
        }
    };

    return (
        <div
            className="modal-overlay"
            onMouseDown={handleBackdropClick}
        >
            <section
                className="modal-container"
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-leave-title"
            >
                <header className="modal-header">
                    <div>
                        <span className="modal-eyebrow">LEAVE MANAGEMENT</span>
                        <h2 id="create-leave-title">New Leave Request</h2>
                        <p>Complete the information below to submit your request.</p>
                    </div>

                    <button
                        type="button"
                        className="modal-close-button"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </header>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="modal-form-field">
                            <label htmlFor="start_date">Start Date</label>
                            <input
                                type="date"
                                id="start_date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                                max={formData.end_date || undefined}
                                required
                            />
                        </div>

                        <div className="modal-form-field">
                            <label htmlFor="end_date">End Date</label>
                            <input
                                type="date"
                                id="end_date"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleChange}
                                min={formData.start_date || undefined}
                                required
                            />
                        </div>

                        <div className="modal-form-field">
                            <label htmlFor="reason">Reason for Leave</label>
                            <textarea
                                id="reason"
                                name="reason"
                                rows="4"
                                placeholder="Please explain your reason for requesting leave"
                                value={formData.reason}
                                onChange={handleChange}
                                maxLength={1000}
                                required
                            />
                            <span className="field-hint">
                {formData.reason.length}/1000 characters
              </span>
                        </div>

                        <div className="request-status-note">
                            <div className="status-dot pending-dot" />
                            <div>
                                <strong>Pending Approval</strong>
                                <p>Your request will be submitted for review by your Division Head.</p>
                            </div>
                        </div>

                        {error && (
                            <div className="modal-error" role="alert">
                                <span>!</span>
                                <p>{error}</p>
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
                            {loading ? "Submitting..." : "Submit Request"}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}

export default CreateLeaveModal;