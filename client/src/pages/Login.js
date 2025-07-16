import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Container, Card } from "react-bootstrap";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { user, login } = useAuth();

  // ✅ Redirect if already logged in
  if (user) return <Navigate to="/" />;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
     const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, formData);

      login(res.data.user, res.data.token);
      toast.success("Login successful!");

      if (res.data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center py-5">
      <Card className="p-4 shadow" style={{ width: "400px" }}>
        <h3 className="text-center mb-3">Login</h3>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control name="email" type="email" onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-1">
            <Form.Label>Password</Form.Label>
            <Form.Control name="password" type="password" onChange={handleChange} required />
          </Form.Group>

          <div className="text-end mb-3">
            <Link to="/forgot-password" className="text-decoration-none">
              Forgot your password?
            </Link>
          </div>

          <Button type="submit" variant="dark" className="w-100">
            Login
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default Login;
