import { useMemo } from "react";
import StudentSidebar from "../components/StudentSidebar";
import { useData } from "../context/DataContext";

import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from "@mui/material";

const defaultSubjects = ["Math", "Science", "English", "History"];

function StudentAttendance() {
  const { attendance: allAttendance = [] } = useData();

  const user =
    JSON.parse(localStorage.getItem("user")) || {};

  const email = user.email || localStorage.getItem("userEmail") || "";
  const normalizedEmail = String(email || "").toLowerCase().trim();

  const attendance = useMemo(() => {
    return allAttendance.filter(
      (item) => String(item?.email || "").toLowerCase().trim() === normalizedEmail
    );
  }, [allAttendance, normalizedEmail]);

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

  const subjectOptions = useMemo(() => {
    const uniqueMap = new Map();

    defaultSubjects.forEach((subject) => {
      const normalized = normalizeSubject(subject);
      uniqueMap.set(normalized.toLowerCase(), normalized);
    });

    attendance.forEach((record) => {
      const normalized = normalizeSubject(record?.subject);
      if (normalized) {
        uniqueMap.set(normalized.toLowerCase(), normalized);
      }
    });

    return Array.from(uniqueMap.values()).sort((a, b) => a.localeCompare(b));
  }, [attendance]);

  // calculate overall attendance %
  const calculateAttendance = () => {

    if (attendance.length === 0) return 0;

    const present = attendance.filter(
      (a) => a.status === "Present"
    ).length;

    return Math.round(
      (present / attendance.length) * 100
    );
  };

  const getColor = (value) => {
    if (value >= 75) return "success";
    if (value >= 50) return "warning";
    return "error";
  };

  const value = calculateAttendance();

  const calculateSubjectAttendance = (subject) => {
    const normalizedSubject = normalizeSubject(subject).toLowerCase();
    const records = attendance.filter(
      (record) => normalizeSubject(record?.subject).toLowerCase() === normalizedSubject
    );

    if (!records.length) return 0;

    const present = records.filter(
      (record) => String(record?.status || "").toLowerCase() === "present"
    ).length;

    return Math.round((present / records.length) * 100);
  };

  return (

    <Box sx={{ display: "flex" }}>

      <StudentSidebar />

      <Box sx={{ flexGrow: 1, p: 4 }}>

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Attendance
        </Typography>

        <Typography color="text.secondary" mb={4}>
          Overall attendance overview
        </Typography>

        <Paper sx={{ p: 3 }}>

          <TableContainer>

            <Table>

              <TableHead>

                <TableRow>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Overall Attendance %</strong></TableCell>
                </TableRow>

              </TableHead>

              <TableBody>

                <TableRow>

                  <TableCell>{email}</TableCell>

                  <TableCell>
                    <Chip
                      label={`${value}%`}
                      color={getColor(value)}
                    />
                  </TableCell>

                </TableRow>

              </TableBody>

            </Table>

          </TableContainer>

        </Paper>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Subject-wise Attendance
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Subject</strong></TableCell>
                  <TableCell><strong>Attendance %</strong></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {subjectOptions.map((subject) => {
                  const subjectValue = calculateSubjectAttendance(subject);
                  return (
                    <TableRow key={subject}>
                      <TableCell>{subject}</TableCell>
                      <TableCell>
                        <Chip label={`${subjectValue}%`} color={getColor(subjectValue)} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

      </Box>

    </Box>

  );
}

export default StudentAttendance;

