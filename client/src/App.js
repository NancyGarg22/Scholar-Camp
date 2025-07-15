import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import Upload from "./pages/Upload";
import Listings from "./pages/Listings";
import Register from "./pages/Register";
import Login from "./pages/Login";
import MyUploads from "./pages/MyUploads";
import EditListing from "./pages/EditListing";
import NotFound from "./pages/NotFound";
import ListingDetails from "./pages/ListingDetails";
import MyBookmarks from "./pages/MyBookmarks";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Unauthorized from "./pages/Unauthorized";
import CommunityForum from "./pages/CommunityForum";
import PublicProfile from "./pages/PublicProfile";
import Home from "./pages/Home";
import { ToastContainer } from "react-toastify";
import AdminRoute from "./components/AdminRoute";
import { useAuth } from "./context/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* 🔐 Public Routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* 🔒 Protected Routes */}
        <Route path="/" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/home" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />

        <Route path="/listings" element={
          <PrivateRoute>
            <Listings />
          </PrivateRoute>
        } />

        <Route path="/upload" element={
          <PrivateRoute>
            <Upload />
          </PrivateRoute>
        } />

        <Route path="/listing/:id" element={
          <PrivateRoute>
            <ListingDetails />
          </PrivateRoute>
        } />

        <Route path="/edit/:id" element={
          <PrivateRoute>
            <EditListing />
          </PrivateRoute>
        } />

        <Route path="/my-uploads" element={
          <PrivateRoute>
            <MyUploads />
          </PrivateRoute>
        } />

        <Route path="/bookmarks" element={
          <PrivateRoute>
            <MyBookmarks />
          </PrivateRoute>
        } />

        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />

        <Route path="/change-password" element={
          <PrivateRoute>
            <ChangePassword />
          </PrivateRoute>
        } />

        <Route path="/profile/:id" element={
          <PrivateRoute>
            <PublicProfile />
          </PrivateRoute>
        } />

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/community-forum" element={<CommunityForum />} />

        {/* Admin-only route */}
        <Route path="/admin-dashboard" element={
          <PrivateRoute requiredRole="admin">
            <AdminDashboard />
          </PrivateRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}

export default App;
