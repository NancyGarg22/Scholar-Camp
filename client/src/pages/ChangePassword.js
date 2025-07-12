import React, { useState } from "react";
import axios from "axios";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";

const ChangePassword = () => {
  const token = localStorage.getItem("token");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        "http://localhost:5000/api/user/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Password updated successfully");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Update failed"));
    }
  };

  return (
    <Container className="py-5 d-flex justify-content-center">
      <Card className="p-4 shadow" style={{ width: "400px" }}>
        <h4 className="mb-3 text-center">🔒 Change Password</h4>
        {message && <Alert variant="info">{message}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Old Password</Form.Label>
            <Form.Control
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button type="submit" variant="dark" className="w-100">
            Update Password
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default ChangePassword;
