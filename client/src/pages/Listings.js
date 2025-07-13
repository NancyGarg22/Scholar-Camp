import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Spinner, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedListings, setBookmarkedListings] = useState([]);

  const { user } = useAuth();
  const navigate = useNavigate();
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
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await axios.patch(
        `http://localhost:5000/api/listings/${id}/bookmark`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBookmarkedListings((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } catch (err) {
      console.error("Bookmark toggle failed", err);
    }
  };

  const handleDownload = (fileUrl) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const link = document.createElement("a");
    link.href = fileUrl.replace("/upload/", "/upload/fl_attachment/");
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">📚 All Listings</h2>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="dark" />
        </div>
      ) : listings.length === 0 ? (
        <p className="text-center">No listings found.</p>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {listings.map((listing) => (
            <Col key={listing._id}>
              <Card className="h-100 shadow border-0 bg-light d-flex flex-column">
                <Card.Body>
                  <Card.Title>{listing.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{listing.subject}</Card.Subtitle>
                  <Card.Text>{listing.description}</Card.Text>

                  {/* ✅ Safe preview handling */}
                  {listing.fileUrl && (
                    <>
                      {listing.fileUrl.endsWith(".pdf") ? (
                        <iframe
                          src={listing.fileUrl}
                          title="PDF Preview"
                          width="100%"
                          height="200px"
                          className="mb-3 border rounded"
                        />
                      ) : listing.fileUrl.match(/\.(jpg|jpeg|png|gif)$/) ? (
                        <img
                          src={listing.fileUrl}
                          alt="Preview"
                          width="100%"
                          height="200px"
                          className="mb-3 border rounded object-fit-cover"
                        />
                      ) : (
                        <p className="text-muted small">Preview not available</p>
                      )}
                    </>
                  )}
                </Card.Body>

                <Card.Footer className="bg-transparent border-0 mt-auto d-flex flex-column gap-2">
                  <Button
                    variant="dark"
                    size="sm"
                    onClick={() => handleDownload(listing.fileUrl)}
                    disabled={!listing.fileUrl}
                  >
                    Download
                  </Button>

                  <Button
                    variant={
                      bookmarkedListings.includes(listing._id)
                        ? "secondary"
                        : "outline-secondary"
                    }
                    onClick={() => handleBookmarkToggle(listing._id)}
                    size="sm"
                  >
                    {bookmarkedListings.includes(listing._id)
                      ? "Bookmarked"
                      : "Bookmark"}
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Listings;
