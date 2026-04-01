import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";

import Grid from "@mui/material/Grid";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Button,
  Card,
  CardContent,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert
} from "@mui/material";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:1234";

function StudentManagement() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    roll: "",
    className: "",
    phone: "",
    dob: ""
  });
  const [savingEdit, setSavingEdit] = useState(false);

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

  const getGrade = (student) => {
    const overall = Number(student?.overall ?? 0);
    if (!Number.isFinite(overall)) return "N/A";
    if (overall >= 90) return "A+";
    if (overall >= 80) return "A";
    if (overall >= 70) return "B";
    if (overall >= 60) return "C";
    if (overall >= 50) return "D";
    return "F";
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
      setError("Could not load students from database.");
    }
  };

  const recentStudentsSorted = useMemo(() => {
    return [...students]
      .sort((a, b) => {
        const da = new Date(a?.createdAt || 0).getTime();
        const db = new Date(b?.createdAt || 0).getTime();
        return db - da;
      })
      .slice(0, 8);
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const name = String(student?.name || "").toLowerCase();
      const roll = String(student?.roll || "");
      const email = String(student?.email || "").toLowerCase();

      const matchesSearch =
        name.includes(search.toLowerCase()) ||
        roll.includes(search) ||
        email.includes(search.toLowerCase());

      const studentGrade = student?.grade || getGrade(student);
      const matchesGrade = gradeFilter === "All" || studentGrade === gradeFilter;

      return matchesSearch && matchesGrade;
    });
  }, [students, search, gradeFilter]);

  const resolveStudentDbId = (student) => {
    if (student?._id) return student._id;
    if (student?.id) return student.id;

    const email = String(student?.email || "").toLowerCase().trim();
    if (!email) return "";

    const matched = students.find(
      (s) => String(s?.email || "").toLowerCase().trim() === email && (s?._id || s?.id)
    );

    return matched?._id || matched?.id || "";
  };

  const handleDelete = async (student) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      const id = resolveStudentDbId(student);
      if (!id) {
        setError("Student record is missing database id. Please reload and try again.");
        return;
      }

      const res = await fetch(`${API_BASE}/api/students/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });

      if (res.status === 401) return handleUnauthorized();

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${txt.slice(0, 120)}`);
      }

      setStudents((prev) => prev.filter((s) => (s?._id || s?.id) !== id));
      setSelectedStudent(null);
    } catch (e) {
      console.error("Delete failed:", e);
      setError("Failed to delete student.");
    }
  };

  useEffect(() => {
    if (!selectedStudent) return;

    setEditForm({
      name: selectedStudent?.name || "",
      email: selectedStudent?.email || "",
      roll: selectedStudent?.roll || "",
      className: selectedStudent?.className || "",
      phone: selectedStudent?.phone || "",
      dob: selectedStudent?.dob || ""
    });
  }, [selectedStudent]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;

    const id = resolveStudentDbId(selectedStudent);
    const originalEmail = String(selectedStudent?.email || "").trim();

    setSavingEdit(true);

    try {
      setError("");

      const payload = {
        name: editForm.name,
        email: editForm.email,
        roll: editForm.roll,
        className: editForm.className,
        phone: editForm.phone,
        dob: editForm.dob
      };

      const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      };

      const candidateRequests = [];

      if (id) {
        candidateRequests.push({ method: "PUT", url: `${API_BASE}/api/students/${id}` });
        candidateRequests.push({ method: "PATCH", url: `${API_BASE}/api/students/${id}` });
      }

      if (originalEmail) {
        const encodedEmail = encodeURIComponent(originalEmail);
        candidateRequests.push({ method: "PUT", url: `${API_BASE}/api/students/email/${encodedEmail}` });
        candidateRequests.push({ method: "PATCH", url: `${API_BASE}/api/students/email/${encodedEmail}` });
      }

      candidateRequests.push({ method: "PUT", url: `${API_BASE}/api/students` });
      candidateRequests.push({ method: "PATCH", url: `${API_BASE}/api/students` });

      let updated = payload;
      let lastFailure = "";
      let didUpdate = false;

      for (const req of candidateRequests) {
        const res = await fetch(req.url, {
          method: req.method,
          headers,
          body: JSON.stringify(payload)
        });

        if (res.status === 401) return handleUnauthorized();

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          lastFailure = `HTTP ${res.status}: ${txt.slice(0, 120)}`;
          continue;
        }

        updated = await res.json().catch(() => payload);
        didUpdate = true;
        break;
      }

      if (!didUpdate) {
        throw new Error(lastFailure || "No compatible update endpoint found.");
      }

      setStudents((prev) =>
        prev.map((student) => {
          const sameId = id && (student?._id || student?.id) === id;
          const sameEmail =
            String(student?.email || "").toLowerCase().trim() ===
            String(originalEmail || "").toLowerCase().trim();

          if (!sameId && !sameEmail) return student;
          return { ...student, ...updated, ...payload };
        })
      );

      setSelectedStudent((prev) => (prev ? { ...prev, ...updated, ...payload } : prev));
    } catch (e) {
      console.error("Update failed:", e);
      setError("Failed to update student.");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AdminSidebar />

      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Student Management
            </Typography>
            <Typography color="text.secondary">
              Manage and view detailed student profiles
            </Typography>
          </Box>

          <Button variant="contained" onClick={() => navigate("/add-student")}>
            + Add New Student
          </Button>
        </Box>

        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Recently Added Students
          </Typography>

          {error ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          {recentStudentsSorted.length === 0 ? (
            <Typography color="text.secondary">No students added yet.</Typography>
          ) : (
            <List disablePadding>
              {recentStudentsSorted.map((s, i) => (
                <Box key={s?._id || s?.email || i}>
                  <ListItem
                    secondaryAction={
                      <Chip
                        size="small"
                        label={s?.className || "No Class"}
                        variant="outlined"
                        color="primary"
                      />
                    }
                  >
                    <ListItemText
                      primary={s?.name || "Unnamed Student"}
                      secondary={`${s?.email || "-"}${s?.roll ? ` • Roll: ${s.roll}` : ""}`}
                    />
                  </ListItem>
                  {i < recentStudentsSorted.length - 1 ? <Divider /> : null}
                </Box>
              ))}
            </List>
          )}
        </Paper>

        <Grid container spacing={2} mt={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <Select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
                <MenuItem value="All">All Grades</MenuItem>
                <MenuItem value="A+">A+</MenuItem>
                <MenuItem value="A">A</MenuItem>
                <MenuItem value="B">B</MenuItem>
                <MenuItem value="C">C</MenuItem>
                <MenuItem value="D">D</MenuItem>
                <MenuItem value="F">F</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={3} mt={2}>
          {filteredStudents.map((student, idx) => {
            const grade = student?.grade || getGrade(student);
            const overall = student?.overall ?? "-";
            const rank = student?.rank ?? "-";
            const attendance = student?.attendance ?? "-";

            return (
              <Grid size={{ xs: 12, md: 4 }} key={student?._id || student?.email || idx}>
                <Card sx={{ cursor: "pointer" }} onClick={() => setSelectedStudent(student)}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar>
                        {String(student?.name || "U")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </Avatar>

                      <Box>
                        <Typography fontWeight="bold">{student?.name || "Unnamed"}</Typography>
                        <Typography variant="body2">Roll No: {student?.roll || "-"}</Typography>
                      </Box>
                    </Box>

                    <Box mt={2}>
                      <Typography>Overall: {overall}%</Typography>
                      <Chip label={`Grade: ${grade}`} sx={{ mr: 1 }} />
                      <Typography>Rank: #{rank}</Typography>
                      <Typography>Attendance: {attendance}%</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Dialog
          open={Boolean(selectedStudent)}
          onClose={() => setSelectedStudent(null)}
          fullWidth
          maxWidth="md"
        >
          {selectedStudent && (
            <>
              <DialogTitle>{selectedStudent?.name || "Student"} - Profile</DialogTitle>

              <DialogContent dividers>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Roll"
                      name="roll"
                      value={editForm.roll}
                      onChange={handleEditChange}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Class"
                      name="className"
                      value={editForm.className}
                      onChange={handleEditChange}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleEditChange}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="date"
                      label="DOB"
                      name="dob"
                      InputLabelProps={{ shrink: true }}
                      value={editForm.dob ? String(editForm.dob).slice(0, 10) : ""}
                      onChange={handleEditChange}
                      sx={{ mb: 2 }}
                    />
                    <Typography>Overall: {selectedStudent?.overall ?? "-"}%</Typography>
                    <Typography>Grade: {selectedStudent?.grade || getGrade(selectedStudent)}</Typography>
                    <Typography>Rank: #{selectedStudent?.rank ?? "-"}</Typography>
                    <Typography>Attendance: {selectedStudent?.attendance ?? "-"}%</Typography>
                  </Grid>
                </Grid>
              </DialogContent>

              <DialogActions>
                <Button variant="contained" onClick={handleUpdateStudent} disabled={savingEdit}>
                  {savingEdit ? "Saving..." : "Save Changes"}
                </Button>
                <Button color="error" onClick={() => handleDelete(selectedStudent)}>
                  Delete
                </Button>
                <Button onClick={() => setSelectedStudent(null)}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Box>
  );
}

export default StudentManagement;