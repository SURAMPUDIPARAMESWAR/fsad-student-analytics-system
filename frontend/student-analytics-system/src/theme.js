import { createTheme } from "@mui/material/styles";

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#2563EB", // Professional blue
      },
      secondary: {
        main: "#10B981", // Emerald green
      },
      background: {
        default: mode === "light" ? "#F9FAFB" : "#0F172A",
        paper: mode === "light" ? "#FFFFFF" : "#1E293B",
      },
    },

    spacing: 8, // 8px base spacing system

    typography: {
      fontFamily: `"Inter", "Poppins", sans-serif`,
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 600,
      },
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },

    shape: {
      borderRadius: 12,
    },
  });