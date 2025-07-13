import React, { useState } from "react";
import { Form, Button, Container, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    file: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    if (e.target.name === "file") {
      setFormData({ ...formData, file: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.file) {
      setError("Please select a file to upload.");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("subject", formData.subject);
    data.append("description", formData.description);
    data.append("file", formData.file);

    try {
      setLoading(true);
      setError("");

      const response = await axios.post("http://localhost:5000/api/listings/upload", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Upload success:", response.data);
      navigate("/my-uploads");
    } catch (err) {
      console.error("❌ Upload failed:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">📤 Upload Notes</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="title" className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="subject" className="mb-3">
          <Form.Label>Subject</Form.Label>
          <Form.Control
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="description" className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="file" className="mb-3">
          <Form.Label>Select File</Form.Label>
          <Form.Control
            type="file"
            name="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.png"
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button variant="dark" type="submit" disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : "Upload"}
        </Button>
      </Form>
    </Container>
  );
};

export default Upload;
