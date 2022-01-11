import React, { useState } from "react";

import { Link } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useAuth } from "../AuthProvider";
import { getLocal, PLAYLIST_NAME_KEY, PLAYLIST_SIZE_KEY, setLocal } from "../../util/local";


const LoginButton = styled(Button)(({ theme }) => ({
  borderRadius: "500px",
  border: "1px solid transparent",
  padding: "16px 48px 18px",
}));

const HeadingTextField = styled(TextField)(({ theme }) => ({
  display: "inline-block",
}));

const HeadingTypography = styled(Typography)(() => ({
  lineHeight: 1.55,
  whiteSpace: "nowrap"
}));

export const Login = () => {
  const theme = useTheme();
  const { login } = useAuth();
  const [playlistName, setPlaylistName] = useState(getLocal(PLAYLIST_NAME_KEY, "recently liked tracks"));
  const [playlistSize, setPlaylistSize] = useState(getLocal(PLAYLIST_SIZE_KEY, 100));

  const handleClick = () => {
    setLocal(PLAYLIST_NAME_KEY, playlistName);
    setLocal(PLAYLIST_SIZE_KEY, playlistSize);
    login();
  };

  return (
    <Container
      sx={{
        display: "flex",
        flexFlow: "column nowrap",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
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
        <Box sx={{ display: "flex", flexFlow: "column nowrap", alignItems: "center", mb: 4 }}>
          <Box sx={{
            display: "flex",
            flexFlow: "row wrap",
            alignItems: "center",
            justifyContent: "center",
            mb: 2
          }}>
            <HeadingTypography sx={{ display: "inline-block" }}>
              Update a playlist named "
            </HeadingTypography>
            <HeadingTextField
              id="playlist-name"
              inputProps={{ style: { textAlign: 'right' } }}
              variant="standard"
              value={playlistName}
              sx={{ width: theme.spacing(16.25) }}
              onChange={({ target: { value }}) => setPlaylistName(value)}
            />
            <HeadingTypography sx={{ display: "inline-block" }}>
              " with your
            </HeadingTypography>
            <HeadingTextField
              id="playlist-size"
              inputProps={{ min: 1, max: 200, style: { textAlign: 'right' } }}
              variant="standard"
              value={playlistSize}
              onChange={({ target: { value }}) => setPlaylistSize(value)}
              sx={{
                marginLeft: theme.spacing(0.5),
                marginRight: theme.spacing(0.5),
                width: theme.spacing(3.25)
              }}
            />
            <HeadingTypography sx={{ display: "inline-block" }}>
              most recently liked tracks.
            </HeadingTypography>
          </Box>
          <HeadingTypography>
            Then, shibefy it.
          </HeadingTypography>
        </Box>

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

      <Box sx={(theme) => ({
          position: { xs: "relative", md: "fixed" },
          bottom: { xs: 0, md: theme.spacing(1) },
          right: { xs: 0, md: theme.spacing(2) },
        })}
      >
        <a href='https://ko-fi.com/U7U119H5C' target='_blank'>
          <img height={36} style={{ border:"0px", height:"36px" }} src='https://cdn.ko-fi.com/cdn/kofi2.png?v=3' alt='Buy Me a Coffee at ko-fi.com' />
        </a>
      </Box>

      <Typography>
        Shibes courtesy of <Link to="https://twitter.com/covoxkid">@covoxkid</Link>'s <Link to="https://shibe.online/">shibe.online</Link>
      </Typography>

    </Container>
  )
};