import { useState, useEffect, useRef } from "react";
import AdminSidebar from "../components/AdminSidebar";
import Grid from "@mui/material/Grid";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert
} from "@mui/material";

const subjectsList = ["Math", "Science", "English", "History"];

function AddMarks() {
  const fileInputRef = useRef(null);

  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);

  const [formData, setFormData] = useState({
    student: "", // student email
    subject: "",
    examType: "",
    marksObtained: "",
    maxMarks: "",
    examDate: ""
  });

  useEffect(() => {
    fetchStudents();
    fetchMarks();
  }, []);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`
  });

  const handleUnauthorized = () => {
    alert("Session expired");
    localStorage.clear();
    window.location.href = "/login";
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("http://localhost:1234/api/students", {
        headers: getAuthHeaders()
      });

      if (res.status === 401) return handleUnauthorized();

      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setStudents([]);
    }
  };

  const fetchMarks = async () => {
    try {
      const res = await fetch("http://localhost:1234/api/marks", {
        headers: getAuthHeaders()
      });

      if (res.status === 401) return handleUnauthorized();

      const data = await res.json();
      setMarks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMarks([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const percentage =
    formData.marksObtained &&
    formData.maxMarks &&
    Number(formData.maxMarks) > 0
      ? ((Number(formData.marksObtained) / Number(formData.maxMarks)) * 100).toFixed(2)
      : "";

  const handleSubmit = async () => {
    if (!formData.student || !formData.subject || !formData.marksObtained) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        email: formData.student,
        subject: formData.subject,
        examType: formData.examType || "Midterm 1",
        score: Number(formData.marksObtained)
      };

      const res = await fetch("http://localhost:1234/api/marks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });

      if (res.status === 401) return handleUnauthorized();

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData?.message || "Failed to add marks");
        return;
      }

      alert("Marks added successfully!");
      setFormData({
        student: "",
        subject: "",
        examType: "",
        marksObtained: "",
        maxMarks: "",
        examDate: ""
      });
      fetchMarks();
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);

      if (lines.length < 2) {
        alert("CSV has no rows");
        return;
      }

      // accepted headers: email,subject,score[,examType] OR student,subject,marksObtained[,examType]
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const emailIdx = headers.indexOf("email");
      const studentIdx = headers.indexOf("student");
      const subjectIdx = headers.indexOf("subject");
      const scoreIdx = headers.indexOf("score");
      const marksIdx = headers.indexOf("marksobtained");
      const examTypeIdx = headers.indexOf("examtype");

      if (subjectIdx === -1 || (emailIdx === -1 && studentIdx === -1) || (scoreIdx === -1 && marksIdx === -1)) {
        alert("CSV headers must include email/student, subject, score/marksObtained");
        return;
      }

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        const email = emailIdx !== -1 ? cols[emailIdx] : cols[studentIdx];
        const subject = cols[subjectIdx];
        const scoreRaw = scoreIdx !== -1 ? cols[scoreIdx] : cols[marksIdx];
        const examType = examTypeIdx !== -1 ? cols[examTypeIdx] : "Midterm 1";
        const score = Number(scoreRaw);

        if (!email || !subject || Number.isNaN(score)) continue;

        await fetch("http://localhost:1234/api/marks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
          },
          body: JSON.stringify({ email, subject, score, examType: examType || "Midterm 1" })
        });
      }

      alert("CSV upload processed");
      fetchMarks();
    } catch (err) {
      console.error(err);
      alert("CSV upload failed");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const entries = marks;

  return (
    <Box sx={{ display: "flex" }}>
      <AdminSidebar />

      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Marks Management
            </Typography>
            <Typography color="text.secondary">
              Add and manage student examination marks
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="success"
            onClick={() => fileInputRef.current?.click()}
          >
            Bulk Upload CSV
          </Button>

          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleCSVUpload}
          />
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Add New Marks Entry
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Student *</InputLabel>
                    <Select
                      name="student"
                      value={formData.student}
                      label="Student *"
                      onChange={handleChange}
                    >
                      <MenuItem value="">Select a student</MenuItem>
                      {students.map((s, i) => (
                        <MenuItem key={s._id || s.email || i} value={s.email}>
                          {s.name} ({s.email})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Subject *</InputLabel>
                    <Select
                      name="subject"
                      value={formData.subject}
                      label="Subject *"
                      onChange={handleChange}
                    >
                      <MenuItem value="">Select subject</MenuItem>
                      {subjectsList.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Exam Type</InputLabel>
                    <Select
                      name="examType"
                      value={formData.examType}
                      label="Exam Type"
                      onChange={handleChange}
                    >
                      <MenuItem value="">Select type</MenuItem>
                      <MenuItem value="Midterm 1">Midterm 1</MenuItem>
                      <MenuItem value="Midterm 2">Midterm 2</MenuItem>
                      <MenuItem value="Lab Internal">Lab Internal</MenuItem>
                      <MenuItem value="Lab External">Lab External</MenuItem>
                      <MenuItem value="End Semester Exam">End Semester Exam</MenuItem>
                      <MenuItem value="Assignment">Assignment</MenuItem>
                      <MenuItem value="Quiz">Quiz</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Marks Obtained *"
                    name="marksObtained"
                    value={formData.marksObtained}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Maximum Marks"
                    name="maxMarks"
                    value={formData.maxMarks}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Percentage"
                    value={percentage ? `${percentage}%` : "-"}
                    disabled
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    type="date"
                    name="examDate"
                    label="Exam Date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.examDate}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid size={12}>
                  <Button variant="contained" onClick={handleSubmit}>
                    + Add Marks Entry
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Entries
              </Typography>

              {entries.length === 0 ? (
                <Alert severity="info">No entries yet</Alert>
              ) : (
                entries.map((entry, index) => (
                  <Paper
                    key={entry._id || index}
                    sx={{ p: 2, mb: 2, backgroundColor: "#f9fafb" }}
                  >
                    <Typography fontWeight="bold">
                      {entry.studentName || entry.email || "Student"}
                    </Typography>
                    <Typography variant="body2">
                      {entry.subject || "-"} {entry.examType ? `- ${entry.examType}` : ""}
                    </Typography>
                    <Typography color="primary">
                      {entry.percentage != null
                        ? `${entry.percentage}%`
                        : entry.score != null
                        ? entry.score
                        : "-"}
                    </Typography>
                  </Paper>
                ))
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default AddMarks;