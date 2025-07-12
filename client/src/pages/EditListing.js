import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, Button, Container } from "react-bootstrap";
import { toast } from "react-toastify";

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
  });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/listings/all`);
        const listing = res.data.find((item) => item._id === id);

        if (!listing) {
          toast.error("Listing not found");
          return navigate("/");
        }

        setFormData({
          title: listing.title,
          subject: listing.subject,
          description: listing.description,
        });
      } catch (err) {
        toast.error("Failed to fetch listing");
      }
    };

    fetchListing();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/listings/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Listing updated");
      navigate("/my-uploads");

    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">✏️ Edit Listing</h2>
      <Form onSubmit={handleUpdate}>
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control name="title" value={formData.title} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Subject</Form.Label>
          <Form.Control name="subject" value={formData.subject} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} />
        </Form.Group>
        <Button type="submit" variant="primary">Update</Button>
      </Form>
    </Container>
  );
};

export default EditListing;
