import React from "react";

import { Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useAuth } from "../AuthProvider";



const LoginButton = styled(Button)(({ theme }) => ({
  borderRadius: "500px",
  border: "1px solid transparent",
  padding: "16px 48px 18px",
}));

export const Login = () => {
  const { login } = useAuth();
  const handleClick = () => {
    login();
  };

  return (
    <Container
      sx={{
        display: "flex",
        flexFlow: "column nowrap",
        alignItems: "center",
        justifyContent: "center",
        height: "100%"
      }}
    >
      <Box sx={{
        display: "flex",
        flex: "1 1 auto",
        flexFlow: "column nowrap",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Typography sx={{ mb: 4 }}>
          Create a playlist with your 100 most recently liked tracks.<br/>Then, shibefy it.
        </Typography>

        <LoginButton
          color="success"
          disableElevation
          size="large"
          variant="contained"
          onClick={handleClick}
        >
          <Typography variant="button">Login with Spotify</Typography>
        </LoginButton>

      </Box>

        <Typography>
          Shibes courtesy of <Link to="https://twitter.com/covoxkid">@covoxkid</Link>'s <Link to="https://shibe.online/">shibe.online</Link>
        </Typography>
    </Container>
  )
};