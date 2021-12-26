import axios from "axios";

export const SPOTIFY_API = "https://api.spotify.com/v1";

export const getPlaylistDuration = (playlist): string => {
  const ms = playlist.tracks.items.reduce((acc, e) => (acc + e.track.duration_ms), 0);
    const mins = ms / 60000;
    const duration = { hrs: Math.floor(mins / 60), mins: Math.floor(mins % 60) };
    return `${duration.hrs} hr ${duration.mins} min`;
};

export const getTrackDuration = (track): string => {
  const duration_s = track.duration_ms / 1000;
  const mins = Math.floor(duration_s / 60);
  const secs = Math.floor(duration_s % 60);
  return `${mins}:${`${secs}`.padStart(2, '0')}`;
};

export const createPlaylist = async (accessToken: string, userId: string, name: string) => {
  const headers = {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  };

  const body = {
    name,
    description: "your recently liked bananas",
    public: true
  }
  const { data } = await axios.post(`${SPOTIFY_API}/users/${userId}/playlists`, body, { headers });
  return data;
};


export const getPlaylist = async (accessToken: string, userId: string, playlistId: string) => {
  const headers = {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  };
  const { data } = await axios.get(`${SPOTIFY_API}/users/${userId}/playlists/${playlistId}`, { headers });
  return data;
};

export const getPlaylists = async (accessToken: string, userId: string) => {
  const headers = {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  };

  let remaining = 1;
  let offset = 0;
  const limit = 50;
  const playlists: any = [];
  while (remaining !== 0) {
    const { data: playlistsData } = await axios.get(`${SPOTIFY_API}/users/${userId}/playlists?limit=${limit}&offset=${offset}`, { headers });
    const { items, total } = playlistsData;

    playlists.push(...items);
    
    const current = offset + limit;
    remaining = total > current
      ? total - current
      : 0;
    offset += limit;
  }

  return playlists;
};

export const getRecentlyLikedTracks = async (accessToken: string, size) => {
  const headers = {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  };

  let remaining = 1;
  let offset = 0;
  const limit = 50;
  const tracks: any = [];
  while (remaining !== 0) {
    const { data: tracksData } = await axios.get(`${SPOTIFY_API}/me/tracks?limit=${limit}&offset=${offset}`, { headers });
    const { items } = tracksData;

    tracks.push(...items.map(({ track }) => track));
    
    const current = offset + limit;
    remaining = size > current
      ? size - current
      : 0;
    offset += limit;
  }
  tracks.splice(size);

  return tracks;
};

export const replacePlaylistTracks = async (accessToken: string, playlistId: string, uris) => {
  const headers = {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  };

  await axios.put(`${SPOTIFY_API}/playlists/${playlistId}/tracks`, { uris }, { headers });
};

export const putPlaylistImage = async (accessToken: string, playlistId: string, image: string) => {
  const headers = {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "image/jpeg"
  };
  await axios.put( `${SPOTIFY_API}/playlists/${playlistId}/images`, image, { headers });
};