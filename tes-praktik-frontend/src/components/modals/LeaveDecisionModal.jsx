import { useState } from "react";
import "./Modal.css";

const API_URL = import.meta.env.VITE_API_URL;

function LeaveDecisionModal({ request, action, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isApprove = action === "approve";

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Jakarta",
        });

    const handleDecision = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("access_token");

            const response = await fetch(
                `${API_URL}/leave-requests/${request.id}/${action}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
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
                    result.message || "Unable to process this request."
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
                if (
                    event.target === event.currentTarget &&
                    !loading
                ) {
                    onClose();
                }
            }}
        >
            <section
                className="modal-container"
                role="dialog"
                aria-modal="true"
                aria-labelledby="decision-title"
            >
                <header className="modal-header">
                    <div>
                        <span className="modal-eyebrow">
                            LEAVE APPROVAL
                        </span>
                        <h2 id="decision-title">
                            {isApprove ? "Approve Request" : "Reject Request"}
                        </h2>
                        <p>
                            Review the request before confirming your decision.
                        </p>
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

                <div className="modal-body">
                    <div className="decision-employee">
                        <span>EMPLOYEE</span>
                        <strong>{request.employee_name}</strong>
                        <small>{request.nip}</small>
                    </div>

                    <div className="decision-details">
                        <div>
                            <span>DIVISION</span>
                            <strong>{request.division_name}</strong>
                        </div>

                        <div>
                            <span>PERIOD</span>
                            <strong>
                                {formatDate(request.start_date)} –{" "}
                                {formatDate(request.end_date)}
                            </strong>
                        </div>

                        <div>
                            <span>DURATION</span>
                            <strong>{request.total_days} days</strong>
                        </div>

                        <div>
                            <span>REASON</span>
                            <p>{request.reason}</p>
                        </div>
                    </div>

                    <div className={`decision-notice ${isApprove ? "approve" : "reject"}`}>
                        <strong>
                            {isApprove
                                ? "Confirm Approval"
                                : "Confirm Rejection"}
                        </strong>
                        <p>
                            {isApprove
                                ? "This leave request will be marked as approved."
                                : "This leave request will be marked as rejected."}
                        </p>
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
                        type="button"
                        className={`modal-primary-button ${isApprove ? "approve-button" : "reject-button"}`}
                        onClick={handleDecision}
                        disabled={loading}
                    >
                        {loading
                            ? "Processing..."
                            : isApprove
                                ? "Confirm Approval"
                                : "Confirm Rejection"}
                    </button>
                </footer>
            </section>
        </div>
    );
}

export default LeaveDecisionModal;
