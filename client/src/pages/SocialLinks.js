// SocialLinks.jsx
import React from "react";
import { FaInstagram, FaLinkedin } from "react-icons/fa";

const SocialLinks = () => {
  return (
    <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
      <a
        href="https://instagram.com/YourProfile"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        style={{ color: "#C13584", fontSize: "24px" }}
      >
        <FaInstagram />
      </a>
      <a
        href="https://linkedin.com/in/YourProfile"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
        style={{ color: "#0A66C2", fontSize: "24px" }}
      >
        <FaLinkedin />
      </a>
    </div>
  );
};

export default SocialLinks;
