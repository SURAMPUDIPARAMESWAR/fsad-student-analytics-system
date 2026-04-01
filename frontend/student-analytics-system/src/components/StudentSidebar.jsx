import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Button,
  Divider
} from "@mui/material";

import { useData } from "../context/DataContext";

function StudentSidebar() {

  const navigate = useNavigate();
  const location = useLocation();

  const { logoutUser } = useData();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { label: "Dashboard", path: "/student" },
    { label: "Reports", path: "/student-reports" },
    { label: "Attendance", path: "/student-attendance" }
  ];

  const handleLogout = () => {
  logoutUser();
  navigate("/login");
  };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 220,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 220,
          boxSizing: "border-box",
          backgroundColor: "#0f172a",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between"
        }
      }}
    >

      {/* Top Section */}
      <Box>

        <Box sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Student Panel
          </Typography>
        </Box>

        <Divider sx={{ backgroundColor: "rgba(255,255,255,0.2)" }} />

        <List>

          {menuItems.map((item) => (

            <ListItemButton
              key={item.path}
              selected={isActive(item.path)}
              onClick={() => navigate(item.path)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "#1e293b"
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "#334155"
                },
                "&:hover": {
                  backgroundColor: "#1e293b"
                }
              }}
            >

              <ListItemText primary={item.label} />

            </ListItemButton>

          ))}

        </List>

      </Box>

      {/* Logout Section */}
      <Box sx={{ p: 2 }}>

        <Divider sx={{ backgroundColor: "rgba(255,255,255,0.2)", mb: 2 }} />

        <Button
          variant="contained"
          color="error"
          fullWidth
          onClick={handleLogout}
        >
          Logout
        </Button>

      </Box>

    </Drawer>
  );
}

export default StudentSidebar;