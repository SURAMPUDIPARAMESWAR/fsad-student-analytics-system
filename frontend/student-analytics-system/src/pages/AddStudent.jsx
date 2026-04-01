import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import Grid from "@mui/material/Grid";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from "@mui/material";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:1234";

function AddStudent() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    roll: "",
    className: ""
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`
  });

  const handleUnauthorized = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const fetchStudents = async () => {
    try {
      setError("");
      const res = await fetch(`${API_BASE}/api/students`, {
        headers: getAuthHeaders()
      });

      if (res.status === 401) return handleUnauthorized();

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${txt.slice(0, 120)}`);
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Expected JSON but got: ${txt.slice(0, 120)}`);
      }

      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch students:", e);
      setStudents([]);
      setError("Could not load students.");
    }
  };

  const recentStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => {
        const da = new Date(a?.createdAt || 0).getTime();
        const db = new Date(b?.createdAt || 0).getTime();
        return db - da;
      })
      .slice(0, 10);
  }, [students]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleAddStudent = async () => {
    if (!formData.name || !formData.email || !formData.roll || !formData.className) {
      setError("Please fill all fields.");
      setSuccess("");
      return;
    }

    try {
      setError("");
      setSuccess("");

      const res = await fetch(`${API_BASE}/api/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify(formData)
      });

      if (res.status === 401) return handleUnauthorized();

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${txt.slice(0, 120)}`);
      }

      setSuccess("Student added successfully.");
      setFormData({ name: "", email: "", roll: "", className: "" });
      fetchStudents();
    } catch (e) {
      console.error("Add student failed:", e);
      setError("Failed to add student.");
      setSuccess("");
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AdminSidebar />

      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Add Student
        </Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Student Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Roll Number"
                name="roll"
                value={formData.roll}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Class"
                name="className"
                value={formData.className}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Button variant="contained" onClick={handleAddStudent} sx={{ mt: 1 }}>
                Add Student
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recently Added Students
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Roll</TableCell>
                  <TableCell>Class</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentStudents.map((s, i) => (
                  <TableRow key={s?._id || s?.id || s?.email || i}>
                    <TableCell>{s?.name || "-"}</TableCell>
                    <TableCell>{s?.email || "-"}</TableCell>
                    <TableCell>{s?.roll || "-"}</TableCell>
                    <TableCell>{s?.className || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
}

export default AddStudent;