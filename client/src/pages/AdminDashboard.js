// Paste this full code into your AdminDashboard.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Spinner, Button } from "react-bootstrap";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const AdminDashboard = () => {
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [monthlyUploads, setMonthlyUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [listingPage, setListingPage] = useState(1);
  const [listingSortBy] = useState("title");
  const [selectedListings, setSelectedListings] = useState([]);
  const perPage = 5;

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersRes, listingsRes, uploadsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/users/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/listings/admin/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/listings/stats/monthly-uploads", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setUsers(usersRes.data);
        setListings(listingsRes.data);
        setMonthlyUploads(uploadsRes.data);
      } catch (err) {
        console.error("Error fetching admin data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [token]);

  const handleDeleteListing = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/listing/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      console.error("Delete listing failed", err);
    }
  };

  const handleSelectListing = (id) => {
    setSelectedListings((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteListings = async () => {
    if (!selectedListings.length) return alert("No listings selected.");
    if (!window.confirm("Are you sure you want to delete selected listings?")) return;
    try {
      await axios.post(
        "http://localhost:5000/api/listings/bulk-delete",
        { ids: selectedListings },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setListings((prev) => prev.filter((l) => !selectedListings.includes(l._id)));
      setSelectedListings([]);
    } catch (err) {
      console.error("Bulk delete failed", err);
    }
  };

  const getOwnerName = (ownerId) => {
    const owner = users.find((u) => u._id === ownerId);
    return owner ? owner.name : ownerId;
  };

  const paginate = (data, page) => data.slice((page - 1) * perPage, page * perPage);

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

  const exportListingsToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      listings.map(({ _id, title, subject, fileUrl, owner, createdAt, downloadCount }) => ({
        ID: _id,
        Title: title,
        Subject: subject,
        FileURL: fileUrl,
        OwnerID: owner,
        CreatedAt: new Date(createdAt).toLocaleString(),
        Downloads: downloadCount || 0,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Listings");
    XLSX.writeFile(workbook, "listings.xlsx");
  };

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F"];
  const fileTypeCounts = listings.reduce((acc, listing) => {
    if (listing.fileUrl && listing.fileUrl.includes(".")) {
      const ext = listing.fileUrl.split(".").pop().toLowerCase();
      acc[ext] = (acc[ext] || 0) + 1;
    }
    return acc;
  }, {});
  const fileTypeData = Object.keys(fileTypeCounts).map((type) => ({
    name: type.toUpperCase(),
    value: fileTypeCounts[type],
  }));

  const listingCountData = users
    .map((u) => ({
      name: u.name,
      count: listings.filter((l) => l.owner === u._id).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const userRoleData = [
    { role: "Admins", count: users.filter((u) => u.role === "admin").length },
    { role: "Clients", count: users.filter((u) => u.role === "client").length },
  ];

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
      <p>
        👥 Total Users: <strong>{users.length}</strong> | 👑 Admins:{" "}
        <strong>{users.filter((u) => u.role === "admin").length}</strong> | 📄 Listings:{" "}
        <strong>{listings.length}</strong>
      </p>

      <div className="mt-4 mb-5">
        <h5>📈 Uploads Over Time</h5>
        {monthlyUploads.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyUploads}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="uploads" stroke="#007bff" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No data available</p>
        )}
      </div>

      <div className="row">
        <div className="col-md-6">
          <h6>User Roles</h6>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={userRoleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#6f42c1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-md-6">
          <h6>Top Uploaders</h6>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={listingCountData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#fd7e14" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-5">
        <h6>File Type Breakdown</h6>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={fileTypeData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {fileTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <h5 className="mt-5">📚 Listings</h5>
<Button
  variant="outline-primary"
  size="sm"
  className="me-2 mb-2"
  onClick={exportListingsToCSV}
>
  ⬇️ Export Listings to CSV
</Button>
<Button
  variant="outline-success"
  size="sm"
  className="me-2 mb-2"  // <-- added me-2 here
  onClick={exportListingsToExcel}
>
  📊 Export Listings to Excel
</Button>
<Button
  variant="danger"
  size="sm"
  className="mb-2"
  onClick={handleBulkDeleteListings}
  disabled={selectedListings.length === 0}
>
  🗑️ Delete Selected Listings
</Button>


      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search listings by title, subject, or owner"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Table striped bordered hover responsive size="sm">
        <thead>
          <tr>
            <th>Select</th>
            <th>Title</th>
            <th>Subject</th>
            <th>Owner</th>
            <th>Downloads</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginate(sortData(filteredListings, listingSortBy), listingPage).map((l) => (
            <tr key={l._id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedListings.includes(l._id)}
                  onChange={() => handleSelectListing(l._id)}
                />
              </td>
              <td>{l.title}</td>
              <td>{l.subject}</td>
              <td>{getOwnerName(l.owner)}</td>
              <td>{l.downloadCount || 0}</td>
              <td>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteListing(l._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default AdminDashboard;
