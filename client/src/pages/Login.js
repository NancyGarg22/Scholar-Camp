import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Container, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // 👈
const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const { login } = useAuth();

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", formData);
    login(res.data.user, res.data.token); // 👈 use context
    alert("Login successful!");
    navigate("/");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Login failed");
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
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control name="password" type="password" onChange={handleChange} required />
          </Form.Group>
          <Button type="submit" variant="dark" className="w-100">Login</Button>
        </Form>
      </Card>
    </Container>
  );
};

export default Login;
