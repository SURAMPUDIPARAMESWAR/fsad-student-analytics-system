import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import DashboardCard from "../components/DashboardCard";

import Grid from "@mui/material/Grid";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Snackbar,
  Alert
} from "@mui/material";

import {
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const subjects = ["Math", "Science", "English", "History"];
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:1234";

function AdminStudentInsights() {
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [dataError, setDataError] = useState("");

  const [selectedStudentEmail, setSelectedStudentEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [comparisonType, setComparisonType] = useState("classAvg");
  const [suggestion, setSuggestion] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`
  });

  const handleUnauthorized = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const fetchJson = async (url) => {
    const res = await fetch(url, { headers: getAuthHeaders() });

    if (res.status === 401) {
      handleUnauthorized();
      return [];
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 120)}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text().catch(() => "");
      throw new Error(`Expected JSON but received: ${text.slice(0, 120)}`);
    }

    return res.json();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataError("");
        const [studentsData, marksData] = await Promise.all([
          fetchJson(`${API_BASE}/api/students`),
          fetchJson(`${API_BASE}/api/marks`)
        ]);

        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setMarks(Array.isArray(marksData) ? marksData : []);
      } catch (error) {
        console.error("Failed to fetch insights data:", error);
        setStudents([]);
        setMarks([]);
        setDataError("Unable to load students/marks from database.");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedStudentEmail && students.length > 0) {
      setSelectedStudentEmail(students[0]?.email || "");
    }
  }, [students, selectedStudentEmail]);

  const selectedStudent = useMemo(
    () => students.find((s) => s?.email === selectedStudentEmail) || null,
    [students, selectedStudentEmail]
  );

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return students;

    return students.filter((student) => {
      const name = (student?.name || "").toLowerCase();
      const email = (student?.email || "").toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [students, searchTerm]);

  const studentMarks = useMemo(() => {
    const normalizedSelectedEmail = String(selectedStudentEmail || "").toLowerCase().trim();

    return subjects.map((sub) => {
      const record = marks.find(
        (m) => {
          const markEmail = String(m?.email || m?.student || "").toLowerCase().trim();
          return m?.subject === sub && markEmail === normalizedSelectedEmail;
        }
      );

      return {
        subject: sub,
        value: record ? Number(record.marksObtained ?? record.score ?? 0) : 0
      };
    });
  }, [marks, selectedStudentEmail, selectedStudent]);

  const average =
    studentMarks.reduce((sum, s) => sum + s.value, 0) / (studentMarks.length || 1);

  const weakSubjects = studentMarks.filter((sub) => sub.value < 40);

  const radarData = studentMarks.map((entry) => ({
    subject: entry.subject,
    score: entry.value,
    target: Math.min(100, entry.value + 10)
  }));

  const trendData = studentMarks.map((entry) => ({
    month: entry.subject,
    yourScore: entry.value,
    classAvg: Math.max(50, entry.value - 5),
    topper: Math.min(100, entry.value + 8)
  }));

  const testData = studentMarks.map((entry, index) => ({
    test: `Test ${index + 1}`,
    score: entry.value
  }));

  const handleSendSuggestion = () => {
    if (!selectedStudent || suggestion.trim() === "") return;

    let existing = [];
    try {
      existing = JSON.parse(localStorage.getItem("suggestions") || "[]");
      if (!Array.isArray(existing)) existing = [];
    } catch {
      existing = [];
    }

    const newSuggestion = {
      student: selectedStudent.name || selectedStudent.email,
      email: selectedStudent.email,
      text: suggestion.trim(),
      createdAt: new Date().toISOString()
    };

    localStorage.setItem("suggestions", JSON.stringify([...existing, newSuggestion]));
    setSuggestion("");
    setOpenSnackbar(true);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AdminSidebar />

      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Student Insights & Comparison
        </Typography>

        {dataError ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {dataError}
          </Alert>
        ) : null}

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Select Student
          </Typography>

          <TextField
            fullWidth
            size="small"
            label="Search student by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth>
            <InputLabel>Student</InputLabel>
            <Select
              value={selectedStudentEmail || ""}
              label="Student"
              onChange={(e) => setSelectedStudentEmail(e.target.value || "")}
            >
              <MenuItem value="">Select student</MenuItem>
              {filteredStudents.map((student, index) => (
                <MenuItem key={student?._id || student?.email || index} value={student?.email || ""}>
                  {student?.name || "Unknown"}
                  {student?.email ? ` (${student.email})` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardCard title="Average Score" value={`${average.toFixed(1)}%`} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardCard
              title="Weak Subjects"
              value={weakSubjects.length ? weakSubjects.map((s) => s.subject).join(", ") : "None"}
            />
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            {(selectedStudent?.name || "Student")}'s Performance
          </Typography>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentMarks}>
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        <Paper sx={{ p: 3, mt: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6">Performance Trend Analysis</Typography>

            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="comparison-label">Comparison</InputLabel>
              <Select
                labelId="comparison-label"
                value={comparisonType}
                label="Comparison"
                onChange={(e) => setComparisonType(e.target.value)}
              >
                <MenuItem value="classAvg">Compare with Class Average</MenuItem>
                <MenuItem value="topper">Compare with Class Topper</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="yourScore" stroke="#2563EB" strokeWidth={3} />
              <Line type="monotone" dataKey={comparisonType} stroke="#10B981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        <Grid container spacing={3} mt={1}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Subject Analysis
              </Typography>

              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis />
                  <Radar dataKey="score" stroke="#2563EB" fill="#2563EB" fillOpacity={0.6} />
                  <Radar dataKey="target" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Test Performance
              </Typography>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={testData}>
                  <XAxis dataKey="test" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#2563EB" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Send Suggestion
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Write improvement suggestion..."
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button variant="contained" onClick={handleSendSuggestion} disabled={!selectedStudentEmail}>
            Send Suggestion
          </Button>
        </Paper>

        <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
          <Alert severity="success" variant="filled">
            Suggestion sent successfully!
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default AdminStudentInsights;