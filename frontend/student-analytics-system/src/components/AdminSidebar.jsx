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

function AdminSidebar() {

  const navigate = useNavigate();
  const location = useLocation();

  const { logoutUser } = useData();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { label: "Dashboard", path: "/admin" },
    { label: "Students", path: "/student-management" },
    { label: "Add Student", path: "/add-student" },
    { label: "Marks", path: "/add-marks" },
    { label: "Attendance", path: "/admin-attendance" },
    { label: "Reports", path: "/admin-reports" },
    { label: "Student Insights", path: "/admin-insights" }
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
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          backgroundColor: "#1e293b",
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
            Admin Panel
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
                  backgroundColor: "#334155"
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "#475569"
                },
                "&:hover": {
                  backgroundColor: "#334155"
                }
              }}
            >

              <ListItemText primary={item.label} />

            </ListItemButton>

          ))}
        </List>

      </Box>

      {/* Bottom Logout Section */}
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

export default AdminSidebar;