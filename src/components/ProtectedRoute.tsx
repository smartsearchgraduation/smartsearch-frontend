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
            setHasAccess(true);
        } else {
            setHasAccess(false);
        }
    }, [navigate]);

    if (hasAccess === null) {
        return null;
    }

    if (!hasAccess) {
        // Redirect to home if no access
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;
