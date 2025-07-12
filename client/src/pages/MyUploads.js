import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const MyUploads = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUploads = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/listings/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUploads(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch your uploads");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Listing deleted successfully");
      fetchUploads();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">📁 My Uploads</h2>

      {loading ? (
        <p className="text-center">Loading your uploads...</p>
      ) : uploads.length === 0 ? (
        <p className="text-center">No uploads found.</p>
      ) : (
        <Row>
          {uploads.map((item) => (
            <Col key={item._id} sm={12} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{item.title || "Untitled"}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {item.subject || "No subject"}
                  </Card.Subtitle>
                  <Card.Text>{item.description || "No description"}</Card.Text>
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary me-2"
                  >
                    Download
                  </a>
                  <Link
                    to={`/edit/${item._id}`}
                    className="btn btn-outline-secondary btn-sm me-2"
                  >
                    Edit
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MyUploads;
