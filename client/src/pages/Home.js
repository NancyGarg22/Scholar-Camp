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
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/listings/all`);
        setListings(res.data);
      } catch (err) {
        console.error("Failed to fetch listings", err);
      }
    };

    const fetchBookmarks = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/listings/bookmarks/my`, {
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
        `${process.env.REACT_APP_API_URL}/api/listings/${listingId}/bookmark`,
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
    <Container className="py-5" style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
      <div className="text-center mb-5">
        <h1 style={{ fontWeight: "700", color: "#000", fontSize: "3rem", letterSpacing: "1px" }}>
          🎓 Welcome to ScholarCamp
        </h1>
        <p style={{ color: "#444", fontSize: "1.15rem", marginTop: "0.5rem" }}>
          Upload, Explore, and Download Notes for Free. Join a community of learners and sharers.
        </p>
        <div className="d-flex justify-content-center gap-3 mt-4">
          <Button
            variant="dark"
            size="md"
            onClick={() => navigate("/upload")}
            style={{
              width: "140px",
              fontWeight: "600",
              padding: "0.4rem 0",
              fontSize: "1rem",
              borderRadius: "6px",
            }}
          >
            Upload Notes
          </Button>
          <Button
            variant="outline-dark"
            size="md"
            onClick={() => navigate("/community-forum")}
            style={{
              width: "140px",
              fontWeight: "600",
              padding: "0.4rem 0",
              fontSize: "1rem",
              borderRadius: "6px",
            }}
          >
            Join Forum
          </Button>
        </div>
      </div>

      <Form className="mb-5">
        <Form.Control
          type="text"
          placeholder="Search by subject or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            border: "2px solid #000",
            borderRadius: "10px",
            padding: "10px 15px",
            fontSize: "1rem",
          }}
        />
      </Form>

      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {filteredListings.length === 0 ? (
          <p className="text-center" style={{ color: "#666" }}>
            No listings found.
          </p>
        ) : (
          filteredListings.map((item) => (
            <Col key={item._id}>
              <Card
                className="h-100"
                style={{
                  borderRadius: "15px",
                  border: "1px solid #ddd",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <div style={{ height: "140px", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/29/29302.png"
                    alt="notes icon"
                    style={{ maxHeight: "100%", maxWidth: "80%", filter: "grayscale(100%)" }}
                  />
                </div>
                <Card.Body>
                  <Card.Title style={{ fontWeight: "700", fontSize: "1.2rem", color: "#000" }}>
                    {item.title}
                  </Card.Title>
                  <Card.Text style={{ fontSize: "0.9rem", color: "#555" }}>
                    <strong>Subject:</strong> {item.subject}
                    <br />
                    {item.description.length > 80 ? item.description.slice(0, 80) + "..." : item.description}
                  </Card.Text>
                  {item.uploadedBy?.name && (
                    <p style={{ fontSize: "0.8rem", color: "#888" }}>
                      Uploaded by:{" "}
                      <a href={`/profile/${item.uploadedBy._id}`} style={{ color: "#000", textDecoration: "underline" }}>
                        {item.uploadedBy.name}
                      </a>
                    </p>
                  )}
                  <div className="d-flex justify-content-between mt-3">
                    <Button
                      variant="dark"
                      size="sm"
                      onClick={() => navigate(`/listing/${item._id}`)}
                      style={{ fontWeight: "600" }}
                    >
                      View
                    </Button>
                    {user && (
                      <Button
                        variant={bookmarkedListings.includes(item._id) ? "secondary" : "outline-secondary"}
                        size="sm"
                        onClick={() => handleBookmarkToggle(item._id)}
                        style={{ fontWeight: "600" }}
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
