import { Card, CardContent, Typography, Box } from "@mui/material";

function DashboardCard({ title, value, icon }) {

  return (

    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        p: 1,
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: 6
        }
      }}
    >

      <CardContent>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >

          <Box>

            <Typography
              variant="subtitle1"
              color="text.secondary"
              gutterBottom
            >
              {title}
            </Typography>

            <Typography
              variant="h4"
              fontWeight="bold"
            >
              {value}
            </Typography>

          </Box>

          {icon && (
            <Box
              sx={{
                fontSize: 40,
                color: "#64748b"
              }}
            >
              {icon}
            </Box>
          )}

        </Box>

      </CardContent>

    </Card>
  );

}

export default DashboardCard;