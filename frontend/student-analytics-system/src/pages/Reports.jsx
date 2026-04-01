import { useMemo, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import DashboardCard from "../components/DashboardCard";
import { useData } from "../context/DataContext";

import Grid from "@mui/material/Grid";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const subjects = ["Math", "Science", "English", "History"];

function Reports() {
  const { students = [], marks = [] } = useData();
  const [selectedExam, setSelectedExam] = useState("Midterm 1");

  const examMarks = useMemo(
    () =>
      marks.filter((m) => {
        const recordExam = String(m?.examType || "").trim();
        if (!recordExam) {
          // Backward compatibility for old records created before examType was stored.
          return selectedExam === "Midterm 1";
        }

        return recordExam === selectedExam;
      }),
    [marks, selectedExam]
  );

  const studentPerformance = useMemo(
    () =>
      students.map((student) => {
        const normalizedStudentEmail = String(student?.email || "").toLowerCase().trim();
        const studentMarks = {};

        subjects.forEach((sub) => {
          const record = examMarks.find((m) => {
            const normalizedMarkEmail = String(m?.email || m?.student || "")
              .toLowerCase()
              .trim();

            return m?.subject === sub && normalizedMarkEmail === normalizedStudentEmail;
          });

          studentMarks[sub] = Number(record?.marksObtained ?? record?.score ?? 0);
        });

        return {
          name: student?.name || "N/A",
          ...studentMarks
        };
      }),
    [students, examMarks]
  );

  const subjectAverages = useMemo(
    () =>
      subjects.map((subject) => {
        const avg =
          studentPerformance.reduce((sum, s) => sum + Number(s[subject] || 0), 0) /
          (studentPerformance.length || 1);

        return { subject, average: Number(avg.toFixed(1)) };
      }),
    [studentPerformance]
  );

  const classAverage = useMemo(() => {
    const total =
      studentPerformance.reduce((sum, s) => {
        const studentAvg =
          subjects.reduce((subSum, sub) => subSum + Number(s[sub] || 0), 0) / subjects.length;
        return sum + studentAvg;
      }, 0) / (studentPerformance.length || 1);

    return total;
  }, [studentPerformance]);

  const passPercentage = useMemo(() => {
    const passCount = studentPerformance.filter((student) =>
      subjects.every((sub) => Number(student[sub] || 0) >= 40)
    ).length;

    return ((passCount / (studentPerformance.length || 1)) * 100).toFixed(1);
  }, [studentPerformance]);

  const topPerformer = useMemo(() => {
    if (studentPerformance.length === 0) return { name: "N/A" };

    return studentPerformance.reduce((prev, curr) => {
      const prevAvg = subjects.reduce((sum, sub) => sum + Number(prev[sub] || 0), 0) / subjects.length;
      const currAvg = subjects.reduce((sum, sub) => sum + Number(curr[sub] || 0), 0) / subjects.length;
      return currAvg > prevAvg ? curr : prev;
    });
  }, [studentPerformance]);

  return (
    <Box sx={{ display: "flex" }}>
      <AdminSidebar />

      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Class Performance Report
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Select Exam Type
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Exam</InputLabel>
            <Select
              value={selectedExam || ""}
              label="Exam"
              onChange={(e) => setSelectedExam(e.target.value || "Midterm 1")}
            >
              <MenuItem value="Midterm 1">Midterm 1</MenuItem>
              <MenuItem value="Midterm 2">Midterm 2</MenuItem>
              <MenuItem value="End Semester Exam">End Semester Exam</MenuItem>
              <MenuItem value="Assignment">Assignment</MenuItem>
              <MenuItem value="Quiz">Quiz</MenuItem>
            </Select>
          </FormControl>
        </Paper>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <DashboardCard title="Class Average" value={`${classAverage.toFixed(1)}%`} />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <DashboardCard title="Pass Percentage" value={`${passPercentage}%`} />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <DashboardCard title="Top Performer" value={topPerformer?.name || "N/A"} />
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {selectedExam} Subject Averages
          </Typography>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectAverages}>
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="average" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Student Performance Table
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  {subjects.map((sub) => (
                    <TableCell key={sub}>{sub}</TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {studentPerformance.map((student, index) => (
                  <TableRow key={student.name + index}>
                    <TableCell>{student.name}</TableCell>
                    {subjects.map((sub) => (
                      <TableCell key={sub}>{student[sub]}</TableCell>
                    ))}
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

export default Reports;