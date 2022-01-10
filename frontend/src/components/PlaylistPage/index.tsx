import React, { useCallback, useEffect, useState } from "react";

import { styled } from "@mui/material/styles";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import { useAuth } from "../AuthProvider";
import { PlaylistMeta } from "../PlaylistMeta";
import { PlaylistTracks } from "../PlaylistTracks";
import { ShibeButton } from "../ShibeButton";
import { createPlaylist, getPlaylistByName, getUser, putPlaylistImage, updatePlaylist } from "../../util/spotify";
import { getShibe } from "./util";


const PLAYLIST_NAME = "recently liked tracks";

const PlaylistContainer = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(0.5),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2),
  }
}))

export const PlaylistPage = () => {
  const { token } = useAuth();
  const [state, setState] = useState<any>({
    img: null,
    imgLoading: false,
    loading: true,
    playlist: null,
    user: null,
  });
  const { loading, img, imgLoading, playlist, user } = state;
  const playlistId = playlist?.id;

  const updateImage = useCallback(async (playlistId) => {
    if (!token || !playlistId) return;
    setState((prevState) => ({
      ...prevState,
      imgLoading: true,
    }));
    const src = await getShibe();
    await putPlaylistImage(token, playlistId, src);
    setState((prevState) => ({
      ...prevState,
      img: `${"data:image/jpeg;base64,"}${src}`,
      imgLoading: false,
    }));
  }, [token]);

  useEffect(() => {
    if (!token) return;
  
    (async () => {
      const user = await getUser(token);
      let playlist: any = null;
      playlist = await getPlaylistByName(token, user.id, PLAYLIST_NAME);
      if (!playlist) {
        playlist = await createPlaylist(token, user.id, PLAYLIST_NAME);
      }
      
      setState({
        img: playlist.images[0].url,
        loading: true,
        playlist,
        user,
      });

      playlist = await updatePlaylist(token, user.id, playlist.id, { name: "recently liked tracks", size: 100 });
      await updateImage(playlist.id);

      setState({
        loading: false,
        img: playlist.images[0].url,
        playlist,
        user,
      });
    })();
  }, [token, updateImage]);

  return (
    <Box>
      <Backdrop
        open={loading}
      >
        <CircularProgress color="inherit" />
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