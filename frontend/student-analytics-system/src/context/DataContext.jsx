import { createContext, useContext, useState, useEffect, useCallback } from "react";

const DataContext = createContext();
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:1234";

export const DataProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authToken, setAuthToken] = useState(localStorage.getItem("token") || "");

  const getAuthHeaders = useCallback(() => {
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
  }, [authToken]);

  useEffect(() => {
    const syncToken = () => setAuthToken(localStorage.getItem("token") || "");

    window.addEventListener("storage", syncToken);
    window.addEventListener("auth-changed", syncToken);

    return () => {
      window.removeEventListener("storage", syncToken);
      window.removeEventListener("auth-changed", syncToken);
    };
  }, []);

  const fetchJson = useCallback(
    async (url) => {
      const res = await fetch(url, { headers: getAuthHeaders() });

      if (res.status === 401) {
        throw new Error("HTTP 401: Unauthorized");
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
    },
    [getAuthHeaders]
  );

  const refreshAll = useCallback(async () => {
    if (!authToken) {
      setStudents([]);
      setMarks([]);
      setAttendance([]);
      setError("");
      setLoading(false);
      return;
    }

    try {
      setError("");
      const [studentsRes, marksRes, attendanceRes] = await Promise.allSettled([
        fetchJson(`${API_BASE}/api/students`).catch(() => []),
        fetchJson(`${API_BASE}/api/marks`).catch(() => []),
        fetchJson(`${API_BASE}/api/attendance`).catch(() => [])
      ]);

      const studentsData = studentsRes.status === "fulfilled" ? studentsRes.value : [];
      const marksData = marksRes.status === "fulfilled" ? marksRes.value : [];
      const attendanceData = attendanceRes.status === "fulfilled" ? attendanceRes.value : [];

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setMarks(Array.isArray(marksData) ? marksData : []);
      setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
    } catch (err) {
      console.error("Failed to sync data:", err);
      setError("Unable to sync live data from database.");
    } finally {
      setLoading(false);
    }
  }, [authToken, fetchJson]);

  useEffect(() => {
    refreshAll();

    // Keep data close to real-time across admin/student dashboards.
    const intervalId = authToken ? setInterval(refreshAll, 10000) : null;
    return () => clearInterval(intervalId);
  }, [authToken, refreshAll]);

  const addStudent = async (student) => {
    const res = await fetch(`${API_BASE}/api/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(student)
    });

    if (!res.ok) throw new Error("Failed to add student");
    await refreshAll();
  };

  const addMarks = async (mark) => {
    const res = await fetch(`${API_BASE}/api/marks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(mark)
    });

    if (!res.ok) throw new Error("Failed to add marks");
    await refreshAll();
  };

  const addAttendance = async (record) => {
    const res = await fetch(`${API_BASE}/api/attendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(record)
    });

    if (!res.ok) throw new Error("Failed to add attendance");
    await refreshAll();
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("role");
    window.dispatchEvent(new Event("auth-changed"));
  };

  return (
    <DataContext.Provider
      value={{
        students,
        marks,
        attendance,
        loading,
        error,
        refreshAll,
        addStudent,
        addMarks,
        addAttendance,
        logoutUser
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);