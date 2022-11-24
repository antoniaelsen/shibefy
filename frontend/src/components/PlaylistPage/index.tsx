import React, { useCallback, useEffect, useMemo, useState } from "react";

import { styled } from "@mui/material/styles";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

import { PlaylistMeta } from "../PlaylistMeta";
import { PlaylistTracks } from "../PlaylistTracks";
import { ShibeButton } from "../ShibeButton";
import { createPlaylist, getPlaylistByName, getUser, putPlaylistImage, updatePlaylist } from "../../util/spotify";
import { getLocal, PLAYLIST_NAME_KEY, PLAYLIST_SIZE_KEY } from "../../util/local";
import { getShibe } from "./util";
import { useAuth } from "../AuthProvider";


const PlaylistContainer = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(0.5),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2),
  }
}))

export const PlaylistPage = () => {
  const [state, setState] = useState<any>({
    img: null,
    imgLoading: false,
    loading: true,
    playlist: null,
    user: null,
  });
  const { logout } = useAuth();
  const [elapsed, setElapsed] = useState(0);
  const { loading, img, imgLoading, playlist, user } = state;
  const playlistId = playlist?.id;

  const updateImage = useCallback(async (playlistId) => {
    if (!playlistId) return;
    setState((prevState) => ({
      ...prevState,
      imgLoading: true,
    }));
    const src = await getShibe();
    await putPlaylistImage(playlistId, src);
    setState((prevState) => ({
      ...prevState,
      img: `${"data:image/jpeg;base64,"}${src}`,
      imgLoading: false,
    }));
  }, []);

  useEffect(() => {
    (async () => {
      const name = getLocal(PLAYLIST_NAME_KEY, "recently liked tracks");
      const size = getLocal(PLAYLIST_SIZE_KEY, 100);

      // Fetch user
      let user;
      try {
        user = await getUser();
        if(user.error?.status === 401) {
          logout();
          return;
        }
      } catch (e) {
        logout();
        return;
      }

      // Fetch playlists, build playlist
      const timers: NodeJS.Timeout[] = [];
      timers.push(setTimeout(() => {
        setElapsed(3000);
      }, 3000));
  
      timers.push(setTimeout(() => {
        setElapsed(5000);
      }, 5000));

      let playlist: any = null;
      playlist = await getPlaylistByName(user.id, name);
      if (!playlist) {
        playlist = await createPlaylist(user.id, name);
      }
      
      setState({
        img: playlist.images?.[0]?.url,
        loading: true,
        playlist,
        user,
      });

      playlist = await updatePlaylist(user.id, playlist.id, { size });
      await updateImage(playlist.id);

      setState({
        loading: false,
        img: playlist.images?.[0]?.url,
        playlist,
        user,
      });

      return () => timers.forEach((timer) => clearTimeout(timer));
    })();
  }, [logout, updateImage]);

  const subtitle = useMemo(() => {
  if (elapsed > 5000) {
    return (<Typography sx={{ mt: 2 }}>You have a lot of playlists...</Typography>);
  }
  return (<Typography sx={{ mt: 2 }}>Assembling your playlist...</Typography>);
  }, [elapsed])

  return (
    <Box>
      <Backdrop
        open={loading}
      >
        <Box sx={{ display: "flex", flexFlow: "column", alignItems: "center" }}>
          <CircularProgress color="inherit" />
          {subtitle}
        </Box>
      </Backdrop>
      {playlist && user && (
        <>
          <PlaylistMeta
            img={img}
            playlist={playlist}
            user={user}
          />
          <PlaylistContainer>
            {playlist && (
              <PlaylistTracks items={playlist.tracks.items} />
            )}
          </PlaylistContainer>
          <ShibeButton
            disabled={imgLoading}
            variant="contained"
            onClick={() => updateImage(playlistId)}
            sx={{ position: "absolute", top: "32px", right: "32px" }}
          >
            NEW SHIBE
          </ShibeButton>
        </>
      )}
    </Box>
  )
};