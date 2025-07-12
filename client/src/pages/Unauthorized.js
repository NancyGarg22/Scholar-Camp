import React from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container className="text-center py-5">
      <h2 className="mb-3 text-danger">🚫 Unauthorized Access</h2>
      <p>You do not have permission to view this page.</p>
      <Button variant="dark" onClick={() => navigate("/")}>
        Go Back Home
      </Button>
    </Container>
  );
};

export default Unauthorized;
