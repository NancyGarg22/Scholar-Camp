import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Container, Card, Button, Spinner } from "react-bootstrap";

const ListingDetails = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/listings/${id}`);
        setListing(res.data);
      } catch (err) {
        console.error("Fetch listing error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleDownload = async () => {
    try {
      await axios.patch(`http://localhost:5000/api/listings/${listing._id}/download`);
      window.open(`http://localhost:5000/${listing.fileUrl}`, "_blank");
    } catch (err) {
      console.error("Failed to update download count", err);
    }
  };

  const handleBookmark = async () => {
    try {
      await axios.patch(
        `http://localhost:5000/api/listings/${listing._id}/bookmark`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBookmarked(!bookmarked);
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

  if (!listing) {
    return (
      <Container className="text-center py-5">
        <h4>Listing not found</h4>
        <Link to="/" className="btn btn-dark mt-3">Go Back</Link>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="shadow p-4">
        <Card.Title as="h2">{listing.title}</Card.Title>
        <Card.Subtitle className="mb-3 text-muted">{listing.subject}</Card.Subtitle>
        <p className="text-muted mt-2">📥 Downloads: {listing.downloadCount}</p>
        <Card.Text>{listing.description}</Card.Text>

        <div className="d-flex gap-2">
          <Button variant="dark" onClick={handleDownload}>Download</Button>
          <Button
            variant={bookmarked ? "secondary" : "outline-secondary"}
            onClick={handleBookmark}
          >
            {bookmarked ? "Bookmarked" : "Bookmark"}
          </Button>
          <Link to="/" className="btn btn-outline-secondary">Back</Link>
        </div>
      </Card>
    </Container>
  );
};

export default ListingDetails;
