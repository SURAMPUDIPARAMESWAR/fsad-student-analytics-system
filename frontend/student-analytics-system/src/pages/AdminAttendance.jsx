import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:1234";
const DEFAULT_SUBJECTS = ["Math", "Science", "English", "History"];

const normalizeSubject = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
};

function AdminAttendance() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedSubject, setSelectedSubject] = useState("");
  const [bulkStatuses, setBulkStatuses] = useState({});
  const [selectedStudentFilter, setSelectedStudentFilter] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [historyStudent, setHistoryStudent] = useState(null);
  const [subjectRegisterRows, setSubjectRegisterRows] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchAttendance();
    fetchMarks();

    const intervalId = setInterval(() => {
      fetchStudents();
      fetchAttendance();
      fetchMarks();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`
  });

  const handleUnauthorized = () => {
    alert("Session expired. Please login again.");
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

  const fetchStudents = async () => {
    try {
      setError("");
      const data = await fetchJson(`${API_BASE}/api/students`);
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      setStudents([]);
      setError("Unable to load students. Check backend URL, CORS, and server status.");
    }
  };

  const fetchAttendance = async () => {
    try {
      setError("");
      const data = await fetchJson(`${API_BASE}/api/attendance`);
      setAttendance(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
      setAttendance([]);
      setError("Unable to load attendance. Check backend URL, CORS, and server status.");
    }
  };

  const fetchMarks = async () => {
    try {
      setError("");
      const data = await fetchJson(`${API_BASE}/api/marks`);
      setMarks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch marks:", err);
      setMarks([]);
    }
  };

  useEffect(() => {
    const map = {};

    students.forEach((student) => {
      const email = String(student?.email || "").toLowerCase().trim();
      if (!email) return;

      const exactRecord = attendance.find((record) => {
        const recEmail = String(record?.email || "").toLowerCase().trim();
        const recDate = String(record?.date || "").slice(0, 10);
        const recSubject = normalizeSubject(record?.subject);
        return recEmail === email && recDate === selectedDate && recSubject === selectedSubject;
      });

      map[email] = String(exactRecord?.status || "Present");
    });

    setBulkStatuses(map);
  }, [students, attendance, selectedDate, selectedSubject]);

  const handleStatusChange = (email, status) => {
    const key = String(email || "").toLowerCase().trim();
    setBulkStatuses((prev) => ({
      ...prev,
      [key]: status
    }));
  };

  const subjectOptions = useMemo(() => {
    const uniqueMap = new Map();

    DEFAULT_SUBJECTS.forEach((subject) => {
      const normalized = normalizeSubject(subject);
      uniqueMap.set(normalized.toLowerCase(), normalized);
    });

    marks.forEach((record) => {
      const subject = normalizeSubject(record?.subject);
      if (subject) {
        uniqueMap.set(subject.toLowerCase(), subject);
      }
    });

    attendance.forEach((record) => {
      const subject = normalizeSubject(record?.subject);
      if (subject) {
        uniqueMap.set(subject.toLowerCase(), subject);
      }
    });

    if (selectedSubject) {
      const normalizedSelected = normalizeSubject(selectedSubject);
      if (normalizedSelected) {
        uniqueMap.set(normalizedSelected.toLowerCase(), normalizedSelected);
      }
    }

    return Array.from(uniqueMap.values()).sort((a, b) => a.localeCompare(b));
  }, [marks, attendance, selectedSubject]);

  const attendanceSubjects = useMemo(() => {
    const uniqueMap = new Map();
    const fallbackSubject = normalizeSubject(selectedSubject);

    attendance.forEach((record) => {
      const subject = normalizeSubject(record?.subject) || fallbackSubject;
      if (subject) {
        uniqueMap.set(subject.toLowerCase(), subject);
      }
    });

    return Array.from(uniqueMap.values()).sort((a, b) => a.localeCompare(b));
  }, [attendance, selectedSubject]);

  const displaySubjects = useMemo(() => {
    if (attendanceSubjects.length > 0) {
      return attendanceSubjects;
    }
    return subjectOptions;
  }, [attendanceSubjects, subjectOptions]);

  useEffect(() => {
    if (subjectOptions.length > 0 && !subjectOptions.includes(selectedSubject)) {
      setSelectedSubject(subjectOptions[0]);
    }
  }, [subjectOptions, selectedSubject]);

  const filteredStudents = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return students.filter((student) => {
      const email = String(student?.email || "");
      const name = String(student?.name || "");

      const matchesDropdown =
        selectedStudentFilter === "All" ||
        email.toLowerCase().trim() === selectedStudentFilter.toLowerCase().trim();

      const matchesSearch =
        !query || name.toLowerCase().includes(query) || email.toLowerCase().includes(query);

      return matchesDropdown && matchesSearch;
    });
  }, [students, selectedStudentFilter, searchText]);

  const calculateAttendanceBySubject = (email, subject) => {
    const normalizedEmail = String(email || "").toLowerCase().trim();
    const normalizedSubject = normalizeSubject(subject).toLowerCase();
    const normalizedFallbackSubject = normalizeSubject(selectedSubject).toLowerCase();

    const records = attendance.filter((record) => {
      const recEmail = String(record?.email || "").toLowerCase().trim();
      const recSubject = (normalizeSubject(record?.subject) || normalizeSubject(selectedSubject)).toLowerCase();
      return recEmail === normalizedEmail && recSubject === normalizedSubject;
    });

    // If there is no explicit subject data yet, fallback legacy rows to currently selected subject.
    if (!records.length && normalizedSubject === normalizedFallbackSubject) {
      const legacyRecords = attendance.filter((record) => {
        const recEmail = String(record?.email || "").toLowerCase().trim();
        const hasSubject = Boolean(normalizeSubject(record?.subject));
        return recEmail === normalizedEmail && !hasSubject;
      });

      if (legacyRecords.length > 0) {
        const presentCount = legacyRecords.filter(
          (record) => String(record?.status || "").toLowerCase() === "present"
        ).length;
        return Math.round((presentCount / legacyRecords.length) * 100);
      }
    }

    if (!records.length) return 0;

    const presentCount = records.filter(
      (record) => String(record?.status || "").toLowerCase() === "present"
    ).length;

    return Math.round((presentCount / records.length) * 100);
  };

  const getSubjectRegisterFromLocal = (subject, studentEmail) => {
    const normalizedSubject = normalizeSubject(subject).toLowerCase();
    const normalizedEmail = String(studentEmail || "").toLowerCase().trim();
    const normalizedSelectedSubject = normalizeSubject(selectedSubject).toLowerCase();

    return attendance
      .filter((record) => {
        const recSubject = normalizeSubject(record?.subject).toLowerCase();
        const recEmail = String(record?.email || "").toLowerCase().trim();
        const isLegacyNoSubject = !recSubject && normalizedSubject === normalizedSelectedSubject;
        return (recSubject === normalizedSubject || isLegacyNoSubject) && recEmail === normalizedEmail;
      })
      .sort((a, b) => {
        const da = new Date(a?.date || a?.createdAt || 0).getTime();
        const db = new Date(b?.date || b?.createdAt || 0).getTime();
        return db - da;
      });
  };

  const handleSaveAll = async () => {
    if (!selectedDate || !selectedSubject) {
      setError("Please select date and subject.");
      return;
    }

    if (students.length === 0) {
      setError("No students found to mark attendance.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      for (const student of students) {
        const email = String(student?.email || "").trim();
        if (!email) continue;

        const key = email.toLowerCase().trim();
        const status = bulkStatuses[key] || "Present";

        const existing = attendance.find((record) => {
          const recEmail = String(record?.email || "").toLowerCase().trim();
          const recDate = String(record?.date || "").slice(0, 10);
          const recSubject = normalizeSubject(record?.subject);
          return recEmail === key && recDate === selectedDate && recSubject === selectedSubject;
        });

        const payload = {
          email,
          date: selectedDate,
          subject: selectedSubject,
          status
        };

        if (existing?._id || existing?.id) {
          const id = existing._id || existing.id;
          let res = await fetch(`${API_BASE}/api/attendance/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders()
            },
            body: JSON.stringify(payload)
          });

          if (res.status === 401) return handleUnauthorized();

          if (!res.ok && (res.status === 404 || res.status === 405)) {
            res = await fetch(`${API_BASE}/api/attendance/${id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders()
              },
              body: JSON.stringify(payload)
            });
          }

          if (!res.ok) {
            const txt = await res.text().catch(() => "");
            throw new Error(`HTTP ${res.status}: ${txt.slice(0, 120)}`);
          }
        } else {
          const res = await fetch(`${API_BASE}/api/attendance`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders()
            },
            body: JSON.stringify(payload)
          });

          if (res.status === 401) return handleUnauthorized();

          if (!res.ok) {
            const txt = await res.text().catch(() => "");
            throw new Error(`HTTP ${res.status}: ${txt.slice(0, 120)}`);
          }
        }
      }

      await fetchAttendance();
      setSuccess("Attendance saved for all students.");
    } catch (err) {
      console.error("Failed to save attendance:", err);
      setError("Failed to save attendance for one or more students.");
    } finally {
      setSaving(false);
    }
  };

  const calculateAttendance = (email) => {
    const records = attendance.filter((a) => a?.email === email);
    if (!records.length) return 0;

    const presentCount = records.filter(
      (r) => String(r?.status || "").toLowerCase() === "present"
    ).length;

    return Math.round((presentCount / records.length) * 100);
  };

  const getStudentAttendanceHistory = (email) => {
    return attendance
      .filter((record) => String(record?.email || "").toLowerCase().trim() === String(email || "").toLowerCase().trim())
      .sort((a, b) => {
        const da = new Date(a?.date || a?.createdAt || 0).getTime();
        const db = new Date(b?.date || b?.createdAt || 0).getTime();
        return db - da;
      });
  };

  const getColor = (value) => {
    if (value >= 75) return "success";
    if (value >= 50) return "warning";
    return "error";
  };

  const handleOpenHistory = async (student, subject, event) => {
    // Blur trigger so it doesn't remain focused while root gets aria-hidden.
    if (event?.currentTarget?.blur) {
      event.currentTarget.blur();
    }

    setHistoryStudent(student);
    setSubjectRegisterRows([]);

    try {
      const data = await fetchJson(
        `${API_BASE}/api/attendance/register?subject=${encodeURIComponent(subject)}&email=${encodeURIComponent(student?.email || "")}`
      );
      const remoteRows = Array.isArray(data) ? data : [];
      if (remoteRows.length > 0) {
        setSubjectRegisterRows(remoteRows);
      } else {
        setSubjectRegisterRows(getSubjectRegisterFromLocal(subject, student?.email));
      }
    } catch (err) {
      console.error("Failed to load subject register, falling back to local data:", err);
      setSubjectRegisterRows(getSubjectRegisterFromLocal(subject, student?.email));
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AdminSidebar />

      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Overall Student Attendance
        </Typography>

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        ) : null}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Mark Attendance (All Students)
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  label="Subject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {subjectOptions.map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                InputLabelProps={{ shrink: true }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Button fullWidth variant="contained" sx={{ height: "56px" }} onClick={handleSaveAll} disabled={saving}>
                Save Attendance For All
              </Button>
            </Grid>
          </Grid>

          <TableContainer sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Email</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status ({selectedSubject})</strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {students.map((student, index) => {
                  const email = String(student?.email || "");
                  const key = email.toLowerCase().trim();
                  const status = bulkStatuses[key] || "Present";

                  return (
                    <TableRow key={student?._id || student?.id || student?.email || index}>
                      <TableCell>{student?.name || "-"}</TableCell>
                      <TableCell>{email || "-"}</TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <Select
                            value={status}
                            onChange={(e) => handleStatusChange(email, e.target.value)}
                          >
                            <MenuItem value="Present">Present</MenuItem>
                            <MenuItem value="Absent">Absent</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Student-wise Attendance for {selectedSubject}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Student Filter</InputLabel>
                <Select
                  label="Student Filter"
                  value={selectedStudentFilter}
                  onChange={(e) => setSelectedStudentFilter(e.target.value)}
                >
                  <MenuItem value="All">All Students</MenuItem>
                  {students.map((student, index) => (
                    <MenuItem key={student?._id || student?.email || index} value={student?.email || ""}>
                      {student?.name || "Unknown"} ({student?.email || "-"})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Search by Name or Email"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Grid>
          </Grid>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Student Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Email</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Attendance Percentage ({selectedSubject})</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Register</strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredStudents.map((student, index) => {
                  const subjectPercent = calculateAttendanceBySubject(student?.email, selectedSubject);
                  return (
                    <TableRow key={student?._id || student?.id || student?.email || index}>
                      <TableCell>{student?.name || "-"}</TableCell>
                      <TableCell>{student?.email || "-"}</TableCell>
                      <TableCell>
                        <Chip label={`${subjectPercent}%`} color={getColor(subjectPercent)} />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(event) => handleOpenHistory(student, selectedSubject, event)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography color="text.secondary">No students match the current filter.</Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Dialog
          open={Boolean(historyStudent)}
          onClose={() => setHistoryStudent(null)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            {(historyStudent?.name || "Student") + " - " + selectedSubject + " Attendance Register"}
          </DialogTitle>
          <DialogContent dividers>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subjectRegisterRows.map((record, index) => {
                    const status = String(record?.status || "-");
                    const statusColor = status.toLowerCase() === "present" ? "success" : "error";
                    const email = String(record?.email || "");
                    const student = students.find(
                      (item) => String(item?.email || "").toLowerCase().trim() === email.toLowerCase().trim()
                    );

                    return (
                      <TableRow key={record?._id || record?.id || `${record?.date}-${index}`}>
                        <TableCell>{record?.date ? String(record.date).slice(0, 10) : "-"}</TableCell>
                        <TableCell>{student?.name || "-"}</TableCell>
                        <TableCell>{email || "-"}</TableCell>
                        <TableCell>
                          <Chip label={status} color={statusColor} size="small" />
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {subjectRegisterRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography color="text.secondary">No attendance register data available.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
}

export default AdminAttendance;