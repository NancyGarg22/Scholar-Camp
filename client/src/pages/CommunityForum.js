import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Spinner,
  ListGroup,
  Modal,
  Collapse,
} from "react-bootstrap";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axiosInstance";

const CommunityForum = () => {
  const token = localStorage.getItem("token");
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newThread, setNewThread] = useState({ title: "", content: "" });
  const [creating, setCreating] = useState(false);
  const [replyText, setReplyText] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [user, setUser] = useState({});

  const fetchThreads = async () => {
    try {
      const res = await axiosInstance.get("/forum/posts");
      setThreads(res.data);
    } catch (err) {
      console.error("❌ Error fetching threads:", err?.response?.data || err.message);
      toast.error(err?.response?.data?.error || "Failed to load threads");
      setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await axiosInstance.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch user data:", err);
    }
  };

  useEffect(() => {
    fetchThreads();
    fetchUser();
  }, []);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewThread({ title: "", content: "" });
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newThread.title || !newThread.content) {
      toast.error("Please fill all fields");
      return;
    }
    setCreating(true);
    try {
      await axiosInstance.post("/forum/posts", newThread);
      toast.success("Thread created!");
      fetchThreads();
      handleCloseModal();
    } catch (err) {
      toast.error("Failed to create thread");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleReplySubmit = async (threadId) => {
    const reply = replyText[threadId];
    if (!reply || !reply.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    try {
      await axiosInstance.post(`/forum/posts/${threadId}/replies`, {
        content: reply,
      });

      toast.success("Reply added!");
      setReplyText({ ...replyText, [threadId]: "" });
      fetchThreads();
    } catch (err) {
      toast.error("Failed to add reply");
      console.error(err);
    }
  };

  return (
    <Container className="py-4">
      <h3 className="mb-4">🗣️ Community Forum</h3>

      <Button variant="primary" onClick={handleShowModal} className="mb-3">
        + Create New Thread
      </Button>

      {loading ? (
        <Spinner animation="border" />
      ) : threads.length === 0 ? (
        <p>No discussions yet. Be the first to start a thread!</p>
      ) : (
        <ListGroup>
          {threads.map((thread) => (
            <ListGroup.Item key={thread._id}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <strong>{thread.title}</strong>
                  <p>{thread.content}</p>
                  <small className="text-muted">
                    Created on {new Date(thread.createdAt).toLocaleString()}
                  </small>
                </div>
                {/* 👤 Optional Social Links */}
                {(user.linkedin || user.instagram) && (
                  <div>
                    {user.linkedin && (
                      <a
                        href={user.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="me-2 text-dark"
                      >
                        <i className="bi bi-linkedin fs-5"></i>
                      </a>
                    )}
                    {user.instagram && (
                      <a
                        href={user.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-dark"
                      >
                        <i className="bi bi-instagram fs-5"></i>
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-2">
                <Button
                  size="sm"
                  variant="link"
                  onClick={() =>
                    setShowReplies((prev) => ({
                      ...prev,
                      [thread._id]: !prev[thread._id],
                    }))
                  }
                >
                  {showReplies[thread._id] ? "Hide Replies" : "View Replies"}
                </Button>
              </div>

              <Collapse in={showReplies[thread._id]}>
                <div className="mt-3">
                  {!thread.replies || thread.replies.length === 0 ? (
                    <p className="text-muted">No replies yet.</p>
                  ) : (
                    <ListGroup variant="flush">
                      {thread.replies.map((reply) => (
                        <ListGroup.Item key={reply._id}>
                          {reply.content}
                          <br />
                          <small className="text-muted">
                            {new Date(reply.createdAt).toLocaleString()}
                          </small>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}

                  <Form.Group className="mt-3">
                    <Form.Control
                      placeholder="Write your reply..."
                      value={replyText[thread._id] || ""}
                      onChange={(e) =>
                        setReplyText({
                          ...replyText,
                          [thread._id]: e.target.value,
                        })
                      }
                    />
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => handleReplySubmit(thread._id)}
                    >
                      Reply
                    </Button>
                  </Form.Group>
                </div>
              </Collapse>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Create Thread Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Thread</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateThread}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter thread title"
                value={newThread.title}
                onChange={(e) =>
                  setNewThread({ ...newThread, title: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Write your message"
                value={newThread.content}
                onChange={(e) =>
                  setNewThread({ ...newThread, content: e.target.value })
                }
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create Thread"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default CommunityForum;
