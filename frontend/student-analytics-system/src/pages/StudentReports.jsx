import { useState, useMemo, useEffect } from "react";
import StudentSidebar from "../components/StudentSidebar";
import { useData } from "../context/DataContext";

import Grid from "@mui/material/Grid";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Alert
} from "@mui/material";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend
} from "recharts";

const subjects = ["Math", "Science", "English", "History"];

function StudentReports() {

  const { marks = [] } = useData();

  const user =
    JSON.parse(localStorage.getItem("user")) || {};

  const email = user.email || localStorage.getItem("userEmail") || "";
  const normalizedEmail = email.toLowerCase().trim();

  const [comparisonType, setComparisonType] =
    useState("classAvg");

  /* ---------------- STUDENT MARKS ---------------- */

  const studentMarks = useMemo(() => {

    return subjects.map((sub) => {

      const record = marks.find(
        (m) => {
          const markEmail = String(m?.email || m?.student || "").toLowerCase().trim();
          return m.subject === sub && markEmail === normalizedEmail;
        }
      );

      return {
        subject: sub,
        marks: record ? Number(record.score ?? record.marksObtained ?? 0) : 0
      };

    });

  }, [marks, normalizedEmail]);

  /* ---------------- RADAR DATA ---------------- */

  const radarData = studentMarks.map((s) => ({
    subject: s.subject,
    score: s.marks,
    target: Math.min(100, s.marks + 10)
  }));

  /* ---------------- TREND DATA ---------------- */

  const trendData = studentMarks.map((s) => ({
    month: s.subject,
    yourScore: s.marks,
    classAvg: Math.max(50, s.marks - 5),
    topper: Math.min(100, s.marks + 8)
  }));

  /* ---------------- TEST DATA ---------------- */

  const testData = studentMarks.map((s, i) => ({
    test: `Test ${i + 1}`,
    score: s.marks
  }));

  return (
    <Box sx={{ display: "flex" }}>

      <StudentSidebar />

      <Box sx={{ flexGrow: 1, p: 4 }}>

        <Typography variant="h4" fontWeight="bold">
          Advanced Performance Analytics
        </Typography>

        <Typography color="text.secondary" mb={4}>
          Deep insights of your academic performance
        </Typography>

        {/* TREND CHART */}
        <Paper sx={{ p: 3, mt: 4 }}>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>

            <Typography variant="h6">
              Performance Trend Analysis
            </Typography>

            <FormControl size="small">
              <Select
                value={comparisonType}
                onChange={(e) =>
                  setComparisonType(e.target.value)
                }
              >
                <MenuItem value="classAvg">
                  Compare with Class Average
                </MenuItem>

                <MenuItem value="topper">
                  Compare with Class Topper
                </MenuItem>
              </Select>
            </FormControl>

          </Box>

          <ResponsiveContainer width="100%" height={250}>

            <LineChart data={trendData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="yourScore"
                stroke="#2563EB"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey={comparisonType}
                stroke="#10B981"
                strokeWidth={3}
              />

            </LineChart>

          </ResponsiveContainer>

        </Paper>

        {/* RADAR + TEST PERFORMANCE */}
        <Grid container spacing={4} mt={2}>

          <Grid size={{ xs: 12, md: 6 }}>

            <Paper sx={{ p: 3 }}>

              <Typography variant="h6">
                Subject Analysis
              </Typography>

              <ResponsiveContainer width="100%" height={300}>

                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis />

                  <Radar
                    dataKey="score"
                    stroke="#2563EB"
                    fill="#2563EB"
                    fillOpacity={0.6}
                  />

                  <Radar
                    dataKey="target"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.3}
                  />

                  <Legend />

                </RadarChart>

              </ResponsiveContainer>

            </Paper>

          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>

            <Paper sx={{ p: 3 }}>

              <Typography variant="h6">
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

        {/* INSIGHTS */}
        <Paper sx={{ p: 3, mt: 4 }}>

          <Typography variant="h6">
            Performance Insights
          </Typography>

          <Alert severity="success" sx={{ mb: 2 }}>
            Strong performance in high scoring subjects.
          </Alert>

          <Alert severity="warning" sx={{ mb: 2 }}>
            Focus on improving weaker subjects.
          </Alert>

          <Alert severity="info">
            Consistency leads to better results.
          </Alert>

        </Paper>

      </Box>

    </Box>
  );
}

export default StudentReports;
