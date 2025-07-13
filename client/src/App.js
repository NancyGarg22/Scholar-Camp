import React from "react";
import { Routes, Route } from "react-router-dom";
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
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Listings />} /> {/* ✅ Default is Browse */}
        <Route path="/listings" element={<Listings />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/listing/:id"
          element={
            <PrivateRoute>
              <ListingDetails />
            </PrivateRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/change-password"
          element={
            <PrivateRoute>
              <ChangePassword />
            </PrivateRoute>
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          path="/bookmarks"
          element={
            <PrivateRoute>
              <MyBookmarks />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-uploads"
          element={
            <PrivateRoute>
              <MyUploads />
            </PrivateRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <Upload />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <PrivateRoute>
              <EditListing />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute requiredRole="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}

export default App;
