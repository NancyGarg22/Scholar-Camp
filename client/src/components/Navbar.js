import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Container, Nav, Navbar as BSNavbar } from "react-bootstrap";
import { Instagram, Linkedin } from "react-bootstrap-icons";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getNavLinkClass = ({ isActive }) =>
    isActive ? "nav-link active-link ms-3" : "nav-link ms-3";

  return (
    <BSNavbar bg="dark" variant="dark" expand="lg" className="py-3">
      <Container>
        {/* Logo and Brand */}
        <NavLink to="/" className="navbar-brand d-flex align-items-center">
          <img
            src={logo}
            alt="ScholarCamp Logo"
            height="30"
            className="me-2"
            style={{ borderRadius: "4px" }}
          />
          <span className="fw-bold fs-4">ScholarCamp</span>
        </NavLink>

        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {/* Home link now goes to `/` */}
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
              Home
            </NavLink>

            <Link to="/upload" className="upload-button">Upload</Link>
            <NavLink to="/listings" className={getNavLinkClass}>Listings</NavLink>
            <NavLink to="/my-uploads" className={getNavLinkClass}>My Uploads</NavLink>
            <NavLink to="/bookmarks" className={getNavLinkClass}>Bookmarks</NavLink>
            <NavLink to="/community-forum" className={getNavLinkClass}>💬 Community Forum</NavLink>

            {!user ? (
              <>
                <NavLink to="/login" className={getNavLinkClass}>Login</NavLink>
                <NavLink to="/register" className={getNavLinkClass}>Register</NavLink>
              </>
            ) : (
              <>
                <span className="nav-link ms-3">Hi, {user.name?.split(" ")[0]}</span>
                <NavLink to="/profile" className={getNavLinkClass}>👤 Profile</NavLink>
                {user?.role === "admin" && (
                  <NavLink to="/admin-dashboard" className="nav-link ms-3 active-link">
                    Admin Panel
                  </NavLink>
                )}
                <button onClick={handleLogout} className="btn btn-outline-light ms-2">
                  Logout
                </button>
              </>
            )}

            {/* Social Icons */}
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
