import React, { useCallback, useEffect, useState } from "react";

import { styled } from "@mui/material/styles";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

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
    })();
  }, [updateImage]);

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