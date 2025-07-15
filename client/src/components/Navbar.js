import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Container, Nav, Navbar as BSNavbar, NavDropdown, Button } from "react-bootstrap";
import { Instagram, Linkedin } from "react-bootstrap-icons";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setExpanded(false);
  };

  const getNavLinkClass = ({ isActive }) =>
    isActive ? "nav-link active-link" : "nav-link";

  return (
    <BSNavbar
      bg="dark"
      variant="dark"
      expand="lg"
      expanded={expanded}
      className="py-3"
      sticky="top"
    >
      <Container>
        <BSNavbar.Brand as={Link} to="/" onClick={() => setExpanded(false)} className="d-flex align-items-center">
          <img
            src={logo}
            alt="ScholarCamp Logo"
            height="30"
            className="me-2"
            style={{ borderRadius: "4px" }}
          />
          <span className="fw-bold fs-4">ScholarCamp</span>
        </BSNavbar.Brand>

        <BSNavbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(!expanded)} />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <NavLink to="/" className={getNavLinkClass} onClick={() => setExpanded(false)}>
              Home
            </NavLink>
            <NavLink to="/listings" className={getNavLinkClass} onClick={() => setExpanded(false)}>
              Listings
            </NavLink>
            <NavLink to="/community-forum" className={getNavLinkClass} onClick={() => setExpanded(false)}>
              💬 Community Forum
            </NavLink>
          </Nav>

          <Nav className="align-items-center">
            <Link to="/upload" className="btn btn-outline-light me-3" onClick={() => setExpanded(false)}>
              Upload
            </Link>

            {!user ? (
              <>
                <NavLink to="/login" className={getNavLinkClass} onClick={() => setExpanded(false)}>
                  Login
                </NavLink>
                <NavLink to="/register" className={getNavLinkClass} onClick={() => setExpanded(false)}>
                  Register
                </NavLink>
              </>
            ) : (
              <NavDropdown
                title={`Hi, ${user.name?.split(" ")[0]}`}
                id="user-nav-dropdown"
                align="end"
                onClick={() => setExpanded(false)}
              >
                <NavDropdown.Item as={Link} to="/profile" onClick={() => setExpanded(false)}>
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-uploads" onClick={() => setExpanded(false)}>
                  My Uploads
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/bookmarks" onClick={() => setExpanded(false)}>
                  Bookmarks
                </NavDropdown.Item>
                {user?.role === "admin" && (
                  <NavDropdown.Item as={Link} to="/admin-dashboard" onClick={() => setExpanded(false)}>
                    Admin Panel
                  </NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            )}

            {/* Social Icons */}
            <Nav.Link
              href="https://instagram.com/your_instagram_handle"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
              className="ms-3"
            >
              <Instagram size={20} color="white" />
            </Nav.Link>
            <Nav.Link
              href="https://linkedin.com/in/your_linkedin_profile"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
              className="ms-2"
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
