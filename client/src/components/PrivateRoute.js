import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (toastMessage === "auth") {
      toast.dismiss();
      toast.warn("Please log in first!", { toastId: "auth-warning" });
    } else if (toastMessage === "role") {
      toast.dismiss();
      toast.error("Access denied!", { toastId: "role-denied" });
    }
  }, [toastMessage]);

  if (loading) return null;

  if (!user) {
    setToastMessage("auth");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    setToastMessage("role");
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;
