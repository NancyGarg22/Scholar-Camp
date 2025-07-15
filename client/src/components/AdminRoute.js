import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    toast.warn("Please log in first", { toastId: "admin-login-required" });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== "admin") {
    toast.error("Access denied");
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default AdminRoute;
