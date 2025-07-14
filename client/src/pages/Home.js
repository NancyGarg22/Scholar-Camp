import React, { useEffect, useState } from "react";
import { Container, Form, Row, Col, Card, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookmarkedListings, setBookmarkedListings] = useState([]);
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/listings/all");
        setListings(res.data);
      } catch (err) {
        console.error("Failed to fetch listings", err);
      }
    };

    const fetchBookmarks = async () => {
      if (!token) return;
      try {
        const res = await axios.get("http://localhost:5000/api/listings/bookmarks/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookmarkedListings(res.data.map((item) => item._id));
      } catch (err) {
        console.error("Failed to fetch bookmarks", err);
      }
    };

    fetchListings();
    fetchBookmarks();
  }, [token]);

const handleBookmarkToggle = async (listingId) => {
  try {
    const res = await axios.patch(
      `http://localhost:5000/api/listings/${listingId}/bookmark`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setBookmarkedListings((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId]
    );

    console.log("✅ Bookmark toggled", res.data);
  } catch (err) {
    console.error("❌ Failed to toggle bookmark", err);
  }
};

  const filteredListings = listings.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container className="py-4" style={{ backgroundColor: "#fff" }}>
      {/* 🎓 Hero Section */}
      <div className="text-center py-5 bg-white border rounded mb-4 shadow-sm">
        <h1 className="fw-bold mb-3 text-dark">🎓 Welcome to ScholarCamp</h1>
        <p className="lead text-muted">
          Upload, Explore, and Download Notes for Free. <br />
          Join a community of learners and sharers.
        </p>
        <div className="d-flex justify-content-center gap-3 mt-3">
          <Button variant="dark" size="lg" href="/upload">Upload Notes</Button>
          <Button variant="outline-dark" size="lg" href="/community-forum">Join Forum</Button>
        </div>
      </div>

      {/* Features */}
      <Row className="text-center mb-5">
        <Col md={4}>
          <h5>📤 Upload Easily</h5>
          <p className="text-muted">Share your notes in seconds.</p>
        </Col>
        <Col md={4}>
          <h5>🔍 Smart Search</h5>
          <p className="text-muted">Find notes instantly.</p>
        </Col>
        <Col md={4}>
          <h5>🤝 Connect</h5>
          <p className="text-muted">Get guidance in the forum.</p>
        </Col>
      </Row>

      {/* Search Bar */}
      <Form className="mb-4">
        <Form.Control
          type="text"
          placeholder="Search by subject or title..."
          className="py-2 border-dark"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form>

      {/* Listings */}
      <Row xs={1} md={2} className="g-4">
        {filteredListings.length === 0 ? (
          <p className="text-center text-muted">No listings found.</p>
        ) : (
          filteredListings.map((item) => (
            <Col key={item._id}>
              <Card className="h-100 shadow-sm border-0 rounded-4 bg-white text-dark">
                <Card.Img
                  variant="top"
                  src="https://cdn-icons-png.flaticon.com/512/29/29302.png"
                  height="160"
                  style={{ objectFit: "contain", padding: "1rem" }}
                />
                <Card.Body>
                  <Card.Title className="fw-semibold">{item.title}</Card.Title>
                  <Card.Text>
                    <strong>Subject:</strong> {item.subject}<br />
                    <strong>Description:</strong> {item.description.slice(0, 60)}...
                  </Card.Text>
                          {item.uploadedBy?.name && (
  <p className="text-muted small">
    Uploaded by:{" "}
    <a href={`/profile/${item.uploadedBy._id}`}>
      {item.uploadedBy.name}
    </a>
  </p>
)}

                  {item.uploaderSocial && (
                    <div className="mt-3 d-flex gap-3 align-items-center">
                      {item.uploaderSocial.instagram && (
                        <a href={item.uploaderSocial.instagram} target="_blank" rel="noreferrer">
                          <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="22" alt="Instagram" />
                        </a>
                      )}
                      {item.uploaderSocial.telegram && (
                        <a href={item.uploaderSocial.telegram} target="_blank" rel="noreferrer">
                          <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="22" alt="Telegram" />
                        </a>
                      )}
                      {item.uploaderSocial.whatsapp && (
                        <a href={item.uploaderSocial.whatsapp} target="_blank" rel="noreferrer">
                          <img src="https://cdn-icons-png.flaticon.com/512/2111/2111728.png" width="22" alt="WhatsApp" />
                        </a>
                      )}
                    </div>
                  )}

                  <div className="d-flex gap-2 mt-3">
                    <Button
                      variant="dark"
                      onClick={() => navigate(`/listing/${item._id}`)}
                      className="flex-fill"
                    >
                      View
                    </Button>
                    {user && (
                      <Button
                        variant={bookmarkedListings.includes(item._id) ? "secondary" : "outline-secondary"}
                        onClick={() => handleBookmarkToggle(item._id)}
                      >
                        {bookmarkedListings.includes(item._id) ? "✓" : "🔖"}
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default Home;
