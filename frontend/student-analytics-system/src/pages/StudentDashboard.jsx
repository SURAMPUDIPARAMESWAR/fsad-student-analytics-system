import { useEffect, useMemo, useState } from "react";
import StudentSidebar from "../components/StudentSidebar";
import DashboardCard from "../components/DashboardCard";
import { useData } from "../context/DataContext";

import Grid from "@mui/material/Grid"; // ✅ FIXED
import {
   Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider
} from "@mui/material";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend
} from "recharts";

const defaultSubjects = ["Math", "Science", "English", "History"];

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

function StudentDashboard() {

  const { marks: localMarks, attendance: allAttendance = [] } = useData();

  const user =
    JSON.parse(localStorage.getItem("user")) || {};

  const studentEmail = user.email || localStorage.getItem("userEmail") || "";
  const studentName = user.name || studentEmail.split("@")[0] || "Student";

  const [suggestions, setSuggestions] = useState([]);
  const [lastMarksUpdate, setLastMarksUpdate] = useState(new Date());
  const marksSource = localMarks;

  const normalizedEmail = studentEmail.toLowerCase().trim();

  const subjectOptions = useMemo(() => {
    const uniqueMap = new Map();

    defaultSubjects.forEach((subject) => {
      const normalized = normalizeSubject(subject);
      uniqueMap.set(normalized.toLowerCase(), normalized);
    });

    marksSource.forEach((mark) => {
      const normalized = normalizeSubject(mark?.subject);
      if (normalized) {
        uniqueMap.set(normalized.toLowerCase(), normalized);
      }
    });

    allAttendance.forEach((record) => {
      const normalized = normalizeSubject(record?.subject);
      if (normalized) {
        uniqueMap.set(normalized.toLowerCase(), normalized);
      }
    });

    return Array.from(uniqueMap.values()).sort((a, b) => a.localeCompare(b));
  }, [marksSource, allAttendance]);

  const studentMarks = useMemo(() => subjectOptions.map((sub) => {
    const record = marksSource.find((m) => {
      const markEmail = String(m?.email || m?.student || "").toLowerCase().trim();
      const markSubject = normalizeSubject(m?.subject);
      return markEmail === normalizedEmail && markSubject === sub;
    });

    return {
      subject: sub,
      value: record ? Number(record.marksObtained ?? record.score ?? 0) : 0
    };
  }), [marksSource, normalizedEmail, subjectOptions]);

  const myAttendance = useMemo(() => {
    return allAttendance.filter(
      (record) => String(record?.email || "").toLowerCase().trim() === normalizedEmail
    );
  }, [allAttendance, normalizedEmail]);

  const attendanceOverall = useMemo(() => {
    if (!myAttendance.length) return 0;
    const present = myAttendance.filter(
      (record) => String(record?.status || "").toLowerCase() === "present"
    ).length;
    return Math.round((present / myAttendance.length) * 100);
  }, [myAttendance]);

  const overall =
    studentMarks.reduce((sum, s) => sum + s.value, 0) /
    (studentMarks.length || 1);

  const grade =
    overall >= 90 ? "A+" :
    overall >= 80 ? "A" :
    overall >= 70 ? "B" :
    overall >= 60 ? "C" :
    overall >= 40 ? "D" : "F";

  const strongSubjects = studentMarks.filter((s) => s.value >= 75);
  const weakSubjects = useMemo(
    () => [...studentMarks].filter((s) => s.value < 50).sort((a, b) => a.value - b.value),
    [studentMarks]
  );

  const subjectData = studentMarks.map((s) => ({
    subject: s.subject,
    score: s.value
  }));

  const trendData = [
    { month: "Nov", percentage: Math.max(0, overall - 10) },
    { month: "Dec", percentage: Math.max(0, overall - 7) },
    { month: "Jan", percentage: Math.max(0, overall - 5) },
    { month: "Feb", percentage: Math.max(0, overall - 3) },
    { month: "Mar", percentage: Math.max(0, overall - 1) },
    { month: "Apr", percentage: Math.min(100, overall) }
  ];

  const radarData = studentMarks.map((s) => ({
    subject: s.subject,
    yourScore: s.value,
    classAvg: s.value - 5
  }));

  useEffect(() => {
    setLastMarksUpdate(new Date());
  }, [marksSource]);

  useEffect(() => {
    const syncSuggestions = () => {
      let allSuggestions = [];

      try {
        allSuggestions = JSON.parse(localStorage.getItem("suggestions") || "[]");
        if (!Array.isArray(allSuggestions)) allSuggestions = [];
      } catch {
        allSuggestions = [];
      }

      const mySuggestions = allSuggestions.filter((item) => {
        const suggestionEmail = String(item?.email || "").toLowerCase().trim();

        if (suggestionEmail) {
          return suggestionEmail === normalizedEmail;
        }

        // Backward compatibility for old suggestions saved without email.
        return String(item?.student || "") === studentName;
      });

      setSuggestions(mySuggestions);
    };

    syncSuggestions();

    const intervalId = setInterval(syncSuggestions, 3000);
    window.addEventListener("storage", syncSuggestions);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", syncSuggestions);
    };
  }, [normalizedEmail, studentName]);

  return (
    <Box sx={{ display: "flex" }}>
      <StudentSidebar />

      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Welcome back, {studentName}! 👋
        </Typography>

        <Typography color="text.secondary" mb={4}>
          Here's a comprehensive overview of your academic journey
        </Typography>

        {/* SUMMARY CARDS */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardCard title="Overall Percentage" value={`${overall.toFixed(1)}%`} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardCard title="Current Grade" value={grade} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardCard title="Class Rank" value="#45" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardCard title="Attendance" value={`${attendanceOverall}%`} />
          </Grid>
        </Grid>

        {/* SUBJECT PERFORMANCE */}
        <Paper sx={{ p: 3, mt: 5 }}>
          <Typography variant="h6" gutterBottom>
            Detailed Subject Performance
          </Typography>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectData}>
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* RADAR + TREND */}
        <Grid container spacing={4} mt={1}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Skills Comparison vs Class Average
              </Typography>

              <ResponsiveContainer width="100%" height={300}>
                <RadarChart outerRadius={90} data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Your Score"
                    dataKey="yourScore"
                    stroke="#2563EB"
                    fill="#2563EB"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Class Average"
                    dataKey="classAvg"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.4}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            6-Month Performance Trend
          </Typography>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#2563EB"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* STRONG & WEAK AREAS */}
        <Grid container spacing={3} mt={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Strong Areas</Typography>
              {strongSubjects.length > 0 ? (
                strongSubjects.map((item) => (
                  <Typography key={item.subject} color="success.main">
                    {item.subject} - {item.value}%
                  </Typography>
                ))
              ) : (
                <Typography color="text.secondary">No strong areas yet.</Typography>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Needs Improvement (Live)</Typography>
              <Typography variant="caption" color="text.secondary">
                Last synced: {lastMarksUpdate.toLocaleTimeString()}
              </Typography>
              {weakSubjects.length > 0 ? (
                weakSubjects.map((item) => (
                  <Typography key={item.subject} color="error.main">
                    {item.subject} - {item.value}%
                  </Typography>
                ))
              ) : (
                <Typography color="text.secondary">No weak areas. Keep it up!</Typography>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Upcoming Tasks</Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Calculus Assignment - Mar 15" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Physics Lab Report - Mar 18" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Essay Writing - Mar 20" />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* IMPROVEMENT PLAN */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Personalized Improvement Plan
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Focus on Geography problem-solving practice." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Practice English grammar exercises daily." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Maintain excellent performance in Science." />
            </ListItem>
          </List>
        </Paper>

        {/* ADMIN SUGGESTIONS */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Suggestions from Admin
          </Typography>

          {suggestions.length > 0 ? (
            suggestions.map((item, index) => (
              <Typography key={index} sx={{ mb: 1 }}>
                {item.text}
              </Typography>
            ))
          ) : (
            <Typography color="text.secondary">
              No suggestions received yet.
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default StudentDashboard;

