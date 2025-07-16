import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";

const MyBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/listings/bookmarks/my`, {

          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBookmarks(res.data);
      } catch (err) {
        console.error("Failed to fetch bookmarks", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [token]); // ✅ included token

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="dark" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4 text-center">🔖 My Bookmarked Notes</h2>
      {bookmarks.length === 0 ? (
        <p className="text-center text-muted">You haven't bookmarked any notes yet.</p>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {bookmarks.map((listing) => (
            <Col key={listing._id}>
              <Card className="h-100 shadow border-0 bg-light">
                <Card.Body>
                  <Card.Title className="fw-bold">{listing.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{listing.subject}</Card.Subtitle>
                  <Card.Text>{listing.description.slice(0, 80)}...</Card.Text>
                </Card.Body>
                <Card.Footer className="bg-transparent border-0">
                  <a
                    href={`${process.env.REACT_APP_API_URL}/${listing.fileUrl}`}

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
      )}
    </Container>
  );
};

export default MyBookmarks;
