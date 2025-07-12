import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Spinner, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedListings, setBookmarkedListings] = useState([]);

  const { user } = useAuth();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/listings/all");
        setListings(res.data);
      } catch (err) {
        console.error("Error fetching listings:", err);
      } finally {
        setLoading(false);
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
        console.error("Error fetching bookmarks:", err);
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
      console.error("Bookmark toggle failed", err);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="dark" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">📚 All Listings</h2>
      <Row xs={1} md={2} lg={3} className="g-4">
        {listings.map((listing) => (
          <Col key={listing._id}>
            <Card className="h-100 shadow border-0 bg-light">
              <Card.Body>
                <Card.Title className="fw-bold">{listing.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{listing.subject}</Card.Subtitle>
                <Card.Text>{listing.description}</Card.Text>
              </Card.Body>
              <Card.Footer className="bg-transparent border-0 d-flex flex-column gap-2">
                <a
                  href={`http://localhost:5000/${listing.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-dark btn-sm w-100"
                >
                  View / Download
                </a>
                {user && (
                  <Button
                    variant={bookmarkedListings.includes(listing._id) ? "secondary" : "outline-secondary"}
                    onClick={() => handleBookmarkToggle(listing._id)}
                    size="sm"
                  >
                    {bookmarkedListings.includes(listing._id) ? "Bookmarked" : "Bookmark"}
                  </Button>
                )}
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Listings;
