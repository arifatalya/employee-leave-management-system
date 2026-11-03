import { useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => Boolean(localStorage.getItem("access_token"))
    );

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={
                        isAuthenticated
                            ? <Navigate to="/dashboard" replace />
                            : <Login onLoginSuccess={() => setIsAuthenticated(true)} />
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        isAuthenticated
                            ? <Dashboard />
                            : <Navigate to="/login" replace />
                    }
                />
                <Route
                    path="/employees"
                    element={
                        isAuthenticated
                            ? <Employees />
                            : <Navigate to="/login" replace />
                    }
                />
                <Route
                    path="*"
                    element={
                        <Navigate
                            to={isAuthenticated ? "/dashboard" : "/login"}
                            replace
                        />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;