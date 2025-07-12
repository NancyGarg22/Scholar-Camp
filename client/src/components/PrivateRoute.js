import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // ⏳ don’t render anything while checking auth

  if (!user) {
    toast.warn("Please log in first!", {
      toastId: "auth-warning",
    });
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
