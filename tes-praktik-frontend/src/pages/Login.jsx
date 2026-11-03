import { useState } from "react";
import "./Login.css";

const API_URL = import.meta.env.VITE_API_URL;

function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Invalid email or password. Please try again."
                );
            }

            const token = result.data?.access_token;

            if (!token) {
                throw new Error("The server did not return an access token.");
            }

            localStorage.setItem("access_token", token);

            onLoginSuccess();
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

    return (
        <main className="login-page">
            <header className="login-brand">
                <div className="login-brand-mark">EL</div>
                <div className="login-brand-text">
                    <strong>ELMS</strong>
                    <span>EMPLOYEE LEAVE MANAGEMENT SYSTEM</span>
                </div>
            </header>
            <section className="login-content">
                <div className="login-card">
                    <div className="login-card-heading">
                        <span className="login-eyebrow"></span>
                        <h1>Welcome back!</h1>
                        <p>Please provide credentials to access the portal.</p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="login-field">
                            <label htmlFor="email">Email address</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="login-field">
                            <label htmlFor="password">Password</label>
                            <div className="login-password-wrapper">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    autoComplete="current-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword((current) => !current)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <path
                                                d="M3 3L21 21M10.6 10.6A2 2 0 0013.4 13.4M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.5 9 7-.2 1.1-1.1 2.5-2.5 3.7M6.2 6.2C4.3 7.5 3.3 9.5 3 12c.5 2.5 4 7 9 7 1.3 0 2.5-.3 3.6-.8"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <path
                                                d="M3 12s3.3-7 9-7 9 7 9 7-3.3 7-9 7-9-7-9-7Z"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                            />
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="3"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="login-message login-error" role="alert">
                                <span className="message-icon">!</span>
                                <p>{error}</p>
                            </div>
                        )}

                        <button
                            className="login-submit-button"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="button-spinner" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>

                    <div className="login-card-footer">
                        <p>
                            Having trouble signing in? Please contact the administrator.
                        </p>
                        <a href="mailto:cmayuzumi@company-name.com">
                            cmayuzumi@company-name.com
                        </a>
                    </div>
                </div>
            </section>
            <footer className="login-page-footer">
                <span>Company Name © 2026</span>
                <span>For Internal Use Only</span>
            </footer>
        </main>
    );
}

export default Login;
