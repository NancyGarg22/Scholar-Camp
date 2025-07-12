import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, Form, Button, Spinner } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        "http://localhost:5000/api/auth/update",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Profile updated!");
    } catch (err) {
      console.error("Update failed", err);
      alert("Update failed");
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({ name: res.data.name, email: res.data.email });
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="dark" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="p-4 shadow-sm">
        <h3 className="mb-3">👤 My Profile</h3>

        {/* ✅ ONE SINGLE FORM */}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </Form.Group>

          {/* ✅ Update Button */}
          <Button type="submit" variant="dark" className="mt-2">
            Save Changes
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default Profile;
