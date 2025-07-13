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
        console.error("❌ Fetch listing error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleDownload = () => {
    if (!listing?.fileUrl) return;
    const url = listing.fileUrl.replace("/upload/", "/upload/fl_attachment/");
    window.open(url, "_blank");
  };

  const handleBookmark = async () => {
    try {
      await axios.patch(
        `http://localhost:5000/api/listings/${listing._id}/bookmark`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookmarked(!bookmarked);
    } catch (err) {
      console.error("❌ Bookmark toggle failed", err);
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
        <Link to="/" className="btn btn-dark mt-3">
          Go Back
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="shadow p-4">
        <Card.Title as="h2">{listing.title}</Card.Title>
        <Card.Subtitle className="mb-3 text-muted">{listing.subject}</Card.Subtitle>
        <p className="text-muted">📥 Downloads: {listing.downloadCount || 0}</p>
        <Card.Text>{listing.description}</Card.Text>

        {listing.fileUrl && (
          <>
            {listing.fileUrl.endsWith(".pdf") ? (
              <iframe
                src={listing.fileUrl}
                width="100%"
                height="400px"
                title="PDF Preview"
                className="mb-4 border rounded"
              />
            ) : listing.fileUrl.match(/\.(jpg|jpeg|png|gif)$/) ? (
              <img
                src={listing.fileUrl}
                alt="Preview"
                width="100%"
                height="400px"
                className="mb-4 border rounded object-fit-cover"
              />
            ) : (
              <p className="text-muted small">No preview available</p>
            )}
          </>
        )}

        <div className="d-flex gap-2">
          <Button variant="dark" onClick={handleDownload}>
            Download
          </Button>
          <Button
            variant={bookmarked ? "secondary" : "outline-secondary"}
            onClick={handleBookmark}
          >
            {bookmarked ? "Bookmarked" : "Bookmark"}
          </Button>
          <Link to="/" className="btn btn-outline-secondary">
            Back
          </Link>
        </div>
      </Card>
    </Container>
  );
};

export default ListingDetails;
