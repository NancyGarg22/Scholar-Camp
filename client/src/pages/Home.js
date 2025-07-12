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
      try {
        if (!token) return;
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

  const handleBookmarkToggle = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/listings/${id}/bookmark`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookmarkedListings((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
    }
  };

  const filteredListings = listings.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container className="py-4">
      <div className="text-center py-5 bg-light rounded mb-4 shadow-sm">
        <h1 className="fw-bold mb-3">📚 Welcome to ScholarCamp</h1>
        <p className="lead text-muted mb-4">
          Upload, Explore, and Download Notes for Free!
        </p>
        <a href="/upload" className="btn btn-dark btn-lg">
          Upload Your Notes
        </a>
      </div>

      <Form className="mb-4">
        <Form.Control
          type="text"
          placeholder="Search by subject or title..."
          className="py-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form>

      <Row>
        {filteredListings.length === 0 ? (
          <p className="text-center">No listings found.</p>
        ) : (
          filteredListings.map((item) => (
            <Col key={item._id} md={4} className="mb-4">
              <Card className="h-100 text-dark shadow-sm">
                <Card.Img
                  variant="top"
                  src={"https://cdn-icons-png.flaticon.com/512/29/29302.png"}
                  height="160"
                  style={{ objectFit: "contain", padding: "1rem" }}
                />
                <Card.Body>
                  <Card.Title>{item.title}</Card.Title>
                  <Card.Text>
                    <strong>Subject:</strong> {item.subject}<br />
                    <strong>Description:</strong>{" "}
                    {item.description.slice(0, 60)}...
                  </Card.Text>
                  <div className="d-flex gap-2">
                    <Button
                      variant="dark"
                      onClick={() => navigate(`/listing/${item._id}`)}
                      className="w-100"
                    >
                      View Details
                    </Button>
                    {user && (
                      <Button
                        variant={bookmarkedListings.includes(item._id) ? "secondary" : "outline-secondary"}
                        onClick={() => handleBookmarkToggle(item._id)}
                      >
                        {bookmarkedListings.includes(item._id) ? "Bookmarked" : "Bookmark"}
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
