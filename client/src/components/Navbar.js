import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Nav, Navbar as BSNavbar } from "react-bootstrap";
import { Instagram, Linkedin } from "react-bootstrap-icons"; // Bootstrap Icons
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <BSNavbar bg="dark" variant="dark" expand="lg" className="py-3">
      <Container>
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img
            src={logo}
            alt="ScholarCamp Logo"
            height="30"
            className="me-2"
            style={{ borderRadius: "4px" }}
          />
          <span className="fw-bold fs-4">ScholarCamp</span>
        </Link>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/upload" className="btn btn-outline-light ms-3 px-3 py-1">Upload</Link>
            <Link to="/listings" className="nav-link ms-3">Listings</Link>
            <Link to="/my-uploads" className="nav-link">My Uploads</Link>
            <Nav.Link as={Link} to="/bookmarks">Bookmarks</Nav.Link>

            {/* ✅ Community Forum */}
            <Link to="/community-forum" className="nav-link ms-3">💬 Community Forum</Link>

            {!user ? (
              <>
                <Link to="/login" className="nav-link ms-3">Login</Link>
                <Link to="/register" className="nav-link ms-2">Register</Link>
              </>
            ) : (
              <>
                <span className="nav-link ms-3">Hi, {user.name?.split(" ")[0]}</span>
                <Link to="/profile" className="nav-link ms-2">👤 Profile</Link>

                {user.role === "admin" && (
                  <Link to="/admin-dashboard" className="nav-link ms-2 text-warning fw-bold">
                    Admin Panel
                  </Link>
                )}

                <button onClick={handleLogout} className="btn btn-outline-light ms-2">
                  Logout
                </button>
              </>
            )}

            {/* 🔗 Social Media Icons */}
            <Nav.Link
              href="https://instagram.com/your_instagram_handle"
              target="_blank"
              rel="noopener noreferrer"
              className="ms-3"
              title="Instagram"
            >
              <Instagram size={20} color="white" />
            </Nav.Link>
            <Nav.Link
              href="https://linkedin.com/in/your_linkedin_profile"
              target="_blank"
              rel="noopener noreferrer"
              className="ms-2"
              title="LinkedIn"
            >
              <Linkedin size={20} color="white" />
            </Nav.Link>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;
