import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  Button,
  Container,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const MyUploads = () => {
  const [uploads, setUploads] = useState([]);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchUploads = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/listings/my-uploads`, {

        headers: { Authorization: `Bearer ${token}` },
      });
      setUploads(res.data);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      toast.error("Failed to fetch your uploads");
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
  headers: { Authorization: `Bearer ${token}` },
});

      setUser(res.data);
    } catch (err) {
      console.error("❌ Fetch user error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/listings/${id}`, {
  headers: { Authorization: `Bearer ${token}` },
});

      toast.success("Listing deleted successfully");
      fetchUploads();
    } catch (err) {
      console.error("❌ Delete error:", err);
      toast.error("Delete failed");
    }
  };

  const handleDownload = (url) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url.replace("/upload/", "/upload/fl_attachment/");
    link.target = "_blank";
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchUploads();
    fetchUser();
  }, []);

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">📁 My Uploads</h2>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="dark" />
        </div>
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

                  {item.fileUrl ? (
                    <>
                      {item.fileUrl.endsWith(".pdf") ? (
                        <iframe
                          src={item.fileUrl}
                          width="100%"
                          height="200px"
                          className="mb-3 border rounded"
                          title="PDF Preview"
                        />
                      ) : item.fileUrl.match(/\.(jpg|jpeg|png|gif)$/) ? (
                        <img
                          src={item.fileUrl}
                          alt="Preview"
                          width="100%"
                          height="200px"
                          className="mb-3 border rounded object-fit-cover"
                        />
                      ) : (
                        <p className="text-muted small">No preview available</p>
                      )}

                      <Button
                        variant="dark"
                        size="sm"
                        className="me-2"
                        onClick={() => handleDownload(item.fileUrl)}
                      >
                        Download
                      </Button>
                    </>
                  ) : (
                    <p className="text-danger small">
                      ⚠️ File not available or was removed.
                    </p>
                  )}

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

                  {(user.linkedin || user.instagram) && (
                    <div className="mt-3">
                      {user.linkedin && (
                        <a
                          href={user.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="me-3 text-dark"
                          aria-label="LinkedIn"
                        >
                          <i className="bi bi-linkedin fs-5"></i>
                        </a>
                      )}
                      {user.instagram && (
                        <a
                          href={user.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-dark"
                          aria-label="Instagram"
                        >
                          <i className="bi bi-instagram fs-5"></i>
                        </a>
                      )}
                    </div>
                  )}
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
