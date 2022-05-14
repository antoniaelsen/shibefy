import React from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { useTheme } from "@mui/system";

const getPlaylistDuration = (playlist) => {
  const { items } = playlist.tracks;
  const totalDurationMs = items.reduce((acc, item) => {
    const { track } = item;
    const { duration_ms } = track;
    return acc + duration_ms;
  }, 0);
  const totalDurationMins = totalDurationMs / 60000;
  const hours = Math.floor(totalDurationMins / 60);
  const mins = Math.floor(totalDurationMins % 60);
  return { hours, mins };
}

const TitleLink = styled(Link)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    fontSize: '48px',
  }
}));

export const PlaylistMeta = ({ img, playlist, user }) => {
  const items = playlist.tracks.items;
  const { hours, mins } = getPlaylistDuration(playlist);

  return (
    <Box sx={{
        p: 4,
        display: "flex",
        flexFlow: {
          xs: "column nowrap",
          sm: "row" 
        },
        alignItems: {
          xs: "center",
          sm: "flex-end"
        },
        position: "relative",
        background: "linear-gradient(0deg, #121212 0%, rgba(60,60,60,1) 100%)",
      }}
    >
      <Box sx={{
          mr: { xs: 0, sm: 4 },
          mb: { xs: 4, sm: 0 } 
        }}>
        <img src={img} alt="A shibe" width={300} height={300} />
      </Box>

      <Box>
        <Typography component="h1" variant="h2">PLAYLIST</Typography>
        <TitleLink
          href={playlist.external_urls.spotify}
          color="textPrimary"
          variant="h1"
          underline="none"
        >
            {playlist.name}
          </TitleLink>
        <Typography color="textSecondary" sx={{ mt: 1 }}>{playlist.description}</Typography>

        <Box sx={{ mt: 1 }}>
          <Link
            href={user.external_urls.spotify}
            color="textPrimary"
            underline="none"
            sx={{ display: "inline-block", pr: 0.5 }}
          >
            {user.display_name}
          </Link>
          <Typography color="textSecondary" sx={{ display: "inline-block"}}>
            {` • ${items?.length || 0} songs, ${hours} hr ${mins} min`}
          </Typography>
        </Box>
      </Box>        

    </Box>
  )
};