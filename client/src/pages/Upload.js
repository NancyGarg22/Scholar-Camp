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
    category: "",
    format: "",
    availability: "",
    lendingDuration: "",
    file: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

   if (formData.format === "Digital (PDF/EPUB)" && !formData.file) {
  setError("File upload is required for digital-only listings.");
  return;
}


    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/listings/upload`, data, {
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
      <h2 className="mb-4">📤 Upload Listing</h2>
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

        <Form.Group controlId="category" className="mb-3">
          <Form.Label>Material Type</Form.Label>
          <Form.Select name="category" value={formData.category} onChange={handleChange} required>
            <option value="">Select category</option>
            <option value="University Notes">University Notes</option>
            <option value="Textbook">Textbook</option>
            <option value="Reference Book">Reference Book</option>
            <option value="Novel / Fiction">Novel / Fiction</option>
            <option value="E-book">E-book</option>
            <option value="Question Paper / Bank">Question Paper / Bank</option>
            <option value="Project Report / Thesis">Project Report / Thesis</option>
            <option value="Study Guide / Short Notes">Study Guide / Short Notes</option>
            <option value="Language Learning Material">Language Learning Material</option>
            <option value="Entrance Exam Book">Entrance Exam Book</option>
            <option value="Other">Other</option>
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="format" className="mb-3">
          <Form.Label>Format</Form.Label>
          <Form.Select name="format" value={formData.format} onChange={handleChange} required>
            <option value="">Select format</option>
            <option value="Digital (PDF/EPUB)">Digital (PDF/EPUB)</option>
            <option value="Physical Copy">Physical Copy</option>
            <option value="Both Available">Both Available</option>
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="availability" className="mb-3">
          <Form.Label>Availability</Form.Label>
          <Form.Select
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            required
          >
            <option value="">Select availability</option>
            <option value="For Download">For Download</option>
            <option value="For Lending Only">For Lending Only</option>
            <option value="For Sale/Donation">For Sale/Donation</option>
            
          </Form.Select>
        </Form.Group>

        {formData.availability === "For Lending Only" && (
          <Form.Group controlId="lendingDuration" className="mb-3">
            <Form.Label>Lending Duration</Form.Label>
            <Form.Control
              type="text"
              name="lendingDuration"
              placeholder="e.g. 10 days, 2 weeks"
              value={formData.lendingDuration}
              onChange={handleChange}
            />
          </Form.Group>
        )}

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
  <Form.Label>Select File (optional unless Digital only)</Form.Label>
  <Form.Control
    type="file"
    name="file"
    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.png"
    onChange={handleChange}
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
