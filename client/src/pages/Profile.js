import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Card,
  Form,
  Button,
  Spinner,
  Table,
  Badge,
} from "react-bootstrap";
import { toast } from "react-toastify";

const Profile = () => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    linkedin: "",
    instagram: "",
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUploads: 0, peopleHelped: 0 });
  const [uploads, setUploads] = useState([]);
  const [publicProfile, setPublicProfile] = useState(true);
  const [savingSocials, setSavingSocials] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/profile/update`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("✅ Profile updated!");
    } catch (err) {
      console.error("Update failed", err);
      toast.error("❌ Failed to update profile");
    }
  };

  const handleSocialSave = async () => {
    setSavingSocials(true);
    try {
     await axios.put(
  `${process.env.REACT_APP_API_URL}/api/users/update-socials`,

        {
          linkedin: formData.linkedin,
          instagram: formData.instagram,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("✅ Social links updated!");
    } catch (err) {
      console.error("Social update failed", err);
      toast.error("❌ Failed to update social links");
    } finally {
      setSavingSocials(false);
    }
  };

  const togglePublic = async () => {
    try {
      const res = await axios.put(
  `${process.env.REACT_APP_API_URL}/api/users/profile/toggle-public`,

        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPublicProfile(res.data.publicProfile);
      toast.success("🔁 Visibility updated");
    } catch (err) {
      console.error("Error toggling visibility", err);
      toast.error("⚠️ Failed to update visibility");
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
      const res = await axios.get(
  `${process.env.REACT_APP_API_URL}/api/users/profile/stats`,

          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStats(res.data);
        setUploads(res.data.uploads || []);
        setPublicProfile(res.data.publicProfile);
      } catch (err) {
        console.error("❌ Error fetching stats:", err);
      }
    };
    fetchStats();
  }, [token]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
 const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {

          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData((prev) => ({
          ...prev,
          name: res.data.name,
          email: res.data.email,
          linkedin: res.data.linkedin || "",
          instagram: res.data.instagram || "",
        }));
      } catch (err) {
        console.error("Failed to fetch profile", err);
        toast.error("⚠️ Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="dark" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* 👤 Basic Info */}
      <Card className="p-4 shadow-sm mb-4">
        <h3 className="mb-3">👤 My Profile</h3>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              type="email"
              value={formData.email}
              disabled
            />
          </Form.Group>
          <Button type="submit" variant="dark" className="me-2">
            💾 Save Changes
          </Button>
        </Form>
      </Card>

      {/* 🔗 Public Profile Settings */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h5>🔗 Public Profile</h5>
          <p>
            Your public profile is currently{" "}
            <strong>{publicProfile ? "Visible" : "Hidden"}</strong>
          </p>
          <Button variant="secondary" onClick={togglePublic}>
            {publicProfile ? "🙈 Hide Profile" : "🌍 Make Public"}
          </Button>

          {publicProfile && (
            <div className="mt-3">
              <Form.Label>Profile Link</Form.Label>
              <Form.Control
                readOnly
                value={`https://scholarcamp.in/users/${formData.name
                  .toLowerCase()
                  .replace(/\s/g, "")}`}
              />

              {/* ✅ Show Socials if available */}
              <div className="mt-3">
                {formData.linkedin && (
                  <a
                    href={formData.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="me-3"
                  >
                    <i className="bi bi-linkedin fs-4 text-primary"></i>
                  </a>
                )}
                {formData.instagram && (
                  <a
                    href={formData.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-instagram fs-4 text-danger"></i>
                  </a>
                )}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* 🌐 Social Media Links */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h5>🌐 Social Media Links</h5>
          <Form.Group className="mb-2">
            <Form.Label>LinkedIn</Form.Label>
            <Form.Control
              type="text"
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedin}
              onChange={(e) =>
                setFormData({ ...formData, linkedin: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Instagram</Form.Label>
            <Form.Control
              type="text"
              placeholder="https://instagram.com/username"
              value={formData.instagram}
              onChange={(e) =>
                setFormData({ ...formData, instagram: e.target.value })
              }
            />
          </Form.Group>
          <Button
            variant="primary"
            className="mt-2"
            onClick={handleSocialSave}
            disabled={savingSocials}
          >
            {savingSocials ? "Saving..." : "💾 Save Social Links"}
          </Button>
        </Card.Body>
      </Card>

      {/* 📊 Contributions */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h5>📊 Your ScholarCamp Contribution</h5>
          <ul>
            <li>
              📚 Total Uploads: <strong>{stats.totalUploads}</strong>
            </li>
            <li>
              🧑‍🤝‍🧑 People Helped: <strong>{stats.peopleHelped}</strong>
            </li>
          </ul>
          {stats.totalUploads >= 10 && (
            <Badge bg="info" className="me-2">
              📘 Power Uploader
            </Badge>
          )}
          {stats.peopleHelped >= 10 && (
            <Badge bg="success">🌟 Scholar Star</Badge>
          )}
        </Card.Body>
      </Card>

      {/* 📁 Upload History */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h5>📁 Your Upload History</h5>
          {uploads.length === 0 ? (
            <p className="text-muted">No uploads yet.</p>
          ) : (
            <Table responsive bordered hover>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((item) => (
                  <tr key={item._id}>
                    <td>{item.title}</td>
                    <td>{item.subject}</td>
                    <td>{item.category}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;
