import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/listings/bookmarks/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookmarks(res.data);
      } catch (err) {
        console.error("Failed to fetch bookmarks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [token]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="dark" />
      </Container>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <Container className="text-center py-5">
        <h4>You haven’t bookmarked any notes yet.</h4>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">🔖 My Bookmarked Notes</h2>
      <Row xs={1} md={2} lg={3} className="g-4">
        {bookmarks.map((listing) => (
          <Col key={listing._id}>
            <Card className="h-100 shadow border-0 bg-light">
              <Card.Body>
                <Card.Title className="fw-bold">{listing.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{listing.subject}</Card.Subtitle>
                <Card.Text>{listing.description}</Card.Text>
              </Card.Body>
              <Card.Footer className="bg-transparent border-0">
                <a
                  href={`http://localhost:5000/${listing.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-dark btn-sm w-100"
                >
                  View / Download
                </a>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Bookmarks;
