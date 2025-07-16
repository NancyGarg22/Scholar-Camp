import React, { useState } from "react";
import axios from "axios";
import { Container, Card, Form, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
     await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password`, { email });

      toast.success("Reset link sent to your email 📩");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center py-5">
      <Card className="p-4 shadow" style={{ width: "400px" }}>
        <h4 className="mb-3 text-center">Forgot Password?</h4>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Button type="submit" variant="dark" className="w-100" disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : "Send Reset Link"}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default ForgotPassword;
