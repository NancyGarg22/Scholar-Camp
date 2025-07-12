import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import Upload from "./pages/Upload";
import Listings from "./pages/Listings";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MyUploads from "./pages/MyUploads";
import EditListing from "./pages/EditListing";
import NotFound from "./pages/NotFound";
import ListingDetails from "./pages/ListingDetails";
import MyBookmarks from "./pages/MyBookmarks"; // ✅ correct import

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/listing/:id" element={<ListingDetails />} />

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
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}

export default App;
