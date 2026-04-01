import { useNavigate } from "react-router-dom";
import { useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button
} from "@mui/material";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:1234";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const handleLogin = async () => {

    try {
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!data) {
        alert("Invalid credentials");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: data.email,
          name: data.name || data.email?.split("@")[0] || "Student",
          role: data.role
        })
      );
      localStorage.setItem("isLoggedIn", "true");
      window.dispatchEvent(new Event("auth-changed"));

      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/student");
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };



  return (

    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg,#f4f6f8,#e2e8f0)"
      }}
    >

      <Card sx={{ width: 420, p: 3, borderRadius: 3 }}>

        <CardContent>

          <Typography variant="h5" fontWeight="bold">
            Login
          </Typography>

          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleLogin}
          >
            Login
          </Button>

          <Button
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => navigate("/")}
          >
            New user? Register
          </Button>

        </CardContent>

      </Card>

    </Box>
  );

}

export default Login;