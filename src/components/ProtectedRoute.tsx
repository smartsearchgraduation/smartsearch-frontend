import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ADMIN_ACCESS_KEY = "smartsearch_admin_access";

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const navigate = useNavigate();
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);

    useEffect(() => {
        const adminAccess = localStorage.getItem(ADMIN_ACCESS_KEY);
        if (adminAccess === "true") {
            // Check for the string "true"
            setHasAccess(true);
        } else {
            // Optional: You could show a message or redirect immediately.
            // For now, we'll just prevent rendering and let Navigate handle it if needed.
            setHasAccess(false);
        }
    }, [navigate]);

    if (hasAccess === null) {
        // Still checking localStorage, render nothing or a loading spinner
        return null;
    }

    if (!hasAccess) {
        // Redirect to home if no access
        return <Navigate to="/" replace />;
    }

    // If access is granted, render the children components
    return <>{children}</>;
}

export default ProtectedRoute;
