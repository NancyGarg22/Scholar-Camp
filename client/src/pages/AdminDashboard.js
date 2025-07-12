import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Spinner, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import Papa from "papaparse";
const AdminDashboard = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [userPage, setUserPage] = useState(1);
  const [listingPage, setListingPage] = useState(1);
  const perPage = 5;

  // Sorting
  const [userSortBy, setUserSortBy] = useState("name");
  const [listingSortBy, setListingSortBy] = useState("title");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersRes, listingsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/user/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/listings/admin/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUsers(usersRes.data);
        setListings(listingsRes.data);
      } catch (err) {
        console.error("Error fetching admin data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("Delete user failed", err);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/listing/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings((prev) => prev.filter((l) => l._id !== listingId));
    } catch (err) {
      console.error("Delete listing failed", err);
    }
  };

  const toggleRole = async (userId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/user/promote/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Role updated!");
      const res = await axios.get("http://localhost:5000/api/user/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Role update failed", err);
      alert("Failed to update role");
    }
  };

  const getOwnerName = (ownerId) => {
    const owner = users.find((u) => u._id === ownerId);
    return owner ? owner.name : ownerId;
  };

  const getUserUploadsCount = (userId) => {
    return listings.filter((l) => l.owner === userId).length;
  };

  const paginate = (data, page) =>
    data.slice((page - 1) * perPage, page * perPage);

  const sortData = (data, key) =>
    [...data].sort((a, b) => a[key]?.localeCompare(b[key]));

  const filteredListings = listings.filter((l) => {
    const ownerName = getOwnerName(l.owner);
    return (
      l.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const exportUsersToCSV = () => {
  const csv = Papa.unparse(
    users.map(({ _id, name, email, role }) => ({
      ID: _id,
      Name: name,
      Email: email,
      Role: role,
    }))
  );

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "users.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportListingsToCSV = () => {
  const csv = Papa.unparse(
    listings.map(({ _id, title, subject, fileUrl, owner, createdAt }) => ({
      ID: _id,
      Title: title,
      Subject: subject,
      FileURL: fileUrl,
      OwnerID: owner,
      CreatedAt: new Date(createdAt).toLocaleString(),
    }))
  );

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "listings.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="dark" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h3 className="mb-4">👑 Admin Dashboard</h3>
<div className="mb-4">
  <h5>📊 Stats Summary</h5>
  <p>
    👥 Total Users: <strong>{users.length}</strong> | 👑 Admins:{" "}
    <strong>{users.filter((u) => u.role === "admin").length}</strong> | 📄 Listings:{" "}
    <strong>{listings.length}</strong>
  </p>
</div>

      {/* USERS */}
     <h5>Users ({users.length}):</h5>
<Button
  variant="outline-primary"
  size="sm"
  className="mb-2"
  onClick={exportUsersToCSV}
>
  ⬇️ Export Users to CSV
</Button>

      <div className="mb-2">
        Sort by:{" "}
        <select
          value={userSortBy}
          onChange={(e) => setUserSortBy(e.target.value)}
          className="form-select form-select-sm d-inline w-auto"
        >
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="role">Role</option>
        </select>
      </div>
      <Table striped bordered hover responsive size="sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Uploads</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginate(sortData(users, userSortBy), userPage).map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{getUserUploadsCount(u._id)}</td>
              <td className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDeleteUser(u._id)}
                >
                  Delete
                </button>
                {u._id !== user._id && (
                  <button
                    className={`btn btn-sm ${
                      u.role === "admin" ? "btn-warning" : "btn-success"
                    }`}
                    onClick={() => toggleRole(u._id)}
                  >
                    {u.role === "admin" ? "Demote" : "Promote"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-flex justify-content-between">
        <Button
          size="sm"
          onClick={() => setUserPage((p) => Math.max(1, p - 1))}
          disabled={userPage === 1}
        >
          Prev
        </Button>
        <span>Page {userPage}</span>
        <Button
          size="sm"
          onClick={() =>
            setUserPage((p) =>
              p < Math.ceil(users.length / perPage) ? p + 1 : p
            )
          }
          disabled={userPage >= Math.ceil(users.length / perPage)}
        >
          Next
        </Button>
      </div>

      {/* LISTINGS */}
     <h5 className="mt-5">Listings ({listings.length}):</h5>
<Button
  variant="outline-primary"
  size="sm"
  className="mb-2"
  onClick={exportListingsToCSV}
>
  ⬇️ Export Listings to CSV
</Button>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search listings by title, subject, or owner name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="mb-2">
        Sort by:{" "}
        <select
          value={listingSortBy}
          onChange={(e) => setListingSortBy(e.target.value)}
          className="form-select form-select-sm d-inline w-auto"
        >
          <option value="title">Title</option>
          <option value="subject">Subject</option>
        </select>
      </div>

      <Table striped bordered hover responsive size="sm">
        <thead>
          <tr>
            <th>Title</th>
            <th>Subject</th>
            <th>Owner</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginate(sortData(filteredListings, listingSortBy), listingPage).map(
            (l) => (
              <tr key={l._id}>
                <td>{l.title}</td>
                <td>{l.subject}</td>
                <td>{getOwnerName(l.owner)}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteListing(l._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between">
        <Button
          size="sm"
          onClick={() => setListingPage((p) => Math.max(1, p - 1))}
          disabled={listingPage === 1}
        >
          Prev
        </Button>
        <span>Page {listingPage}</span>
        <Button
          size="sm"
          onClick={() =>
            setListingPage((p) =>
              p < Math.ceil(filteredListings.length / perPage) ? p + 1 : p
            )
          }
          disabled={listingPage >= Math.ceil(filteredListings.length / perPage)}
        >
          Next
        </Button>
      </div>
    </Container>
  );
};

export default AdminDashboard;
