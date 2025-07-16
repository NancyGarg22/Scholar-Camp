import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Container, Spinner, Card, Alert } from "react-bootstrap";

const PublicProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/public/${id}`);
        setUser(res.data);
        setUploads(res.data.uploads || []);
      } catch (err) {
        console.error("Error fetching public profile", err);
        setError("Unable to fetch profile. It may be private or unavailable.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="mt-4">
      <h2 className="mb-3">📘 {user.name}'s Public Profile</h2>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role || "User"}</p>

      {/* 🌐 Social Media Links */}
      <div className="mb-4">
        {user.linkedin && (
          <a href={user.linkedin} target="_blank" rel="noreferrer" className="me-3">
            <img src="https://cdn-icons-png.flaticon.com/512/145/145807.png" width="28" alt="LinkedIn" />
          </a>
        )}
        {user.instagram && (
          <a href={user.instagram} target="_blank" rel="noreferrer">
            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="28" alt="Instagram" />
          </a>
        )}
      </div>

      <hr />
      <h4 className="mb-3">📂 Uploads:</h4>
      {uploads.length === 0 ? (
        <p className="text-muted">No uploads found.</p>
      ) : (
        uploads.map((upload) => (
          <Card key={upload._id} className="mb-3 bg-light border-0 shadow-sm">
            <Card.Body>
              <Card.Title>{upload.title}</Card.Title>
              <Card.Subtitle className="text-muted">{upload.subject}</Card.Subtitle>
              <Card.Text>{upload.description}</Card.Text>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default PublicProfile;
