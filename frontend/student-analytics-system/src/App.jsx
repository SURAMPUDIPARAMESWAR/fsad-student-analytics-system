import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { useMemo, useState } from "react";
import { getTheme } from "./theme";

import { DataProvider } from "./context/DataContext";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AddStudent from "./pages/AddStudent";
import AddMarks from "./pages/AddMarks";
import Reports from "./pages/Reports";
import StudentReports from "./pages/StudentReports";
import AdminStudentInsights from "./pages/AdminStudentInsights";
import AdminAttendance from "./pages/AdminAttendance";
import StudentManagement from "./pages/StudentManagement";
import StudentAttendance from "./pages/StudentAttendance";


function App() {

  const [mode, setMode] = useState("light");

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (

    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Router>

        <DataProvider>

          <Routes>

            {/* DEFAULT PAGE */}
            <Route path="/" element={<Register />} />

            {/* AUTH */}
            <Route path="/login" element={<Login />} />

            {/* ADMIN */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin-attendance" element={<AdminAttendance />} />
            <Route path="/student-management" element={<StudentManagement />} />
            <Route path="/add-student" element={<AddStudent />} />
            <Route path="/add-marks" element={<AddMarks />} />
            <Route path="/admin-reports" element={<Reports />} />
            <Route path="/admin-insights" element={<AdminStudentInsights />} />

            {/* STUDENT */}
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student-attendance" element={<StudentAttendance />} />
            <Route path="/student-reports" element={<StudentReports />} />

          </Routes>

        </DataProvider>

      </Router>

    </ThemeProvider>

  );
}

export default App;