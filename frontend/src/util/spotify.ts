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

  const body = JSON.stringify({
    name,
    description: "your recently liked bananas",
    public: true
  });
  const res = await fetch(`${SPOTIFY_API}/users/${userId}/playlists`, { method: "POST", body, headers });
  return res.json();
};

export const getPlaylist = async (accessToken: string, userId: string, playlistId: string) => {
  const headers = {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  };
  const res = await fetch(`${SPOTIFY_API}/users/${userId}/playlists/${playlistId}`, { headers });
  return res.json();
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
    const res = await fetch(`${SPOTIFY_API}/users/${userId}/playlists?limit=${limit}&offset=${offset}`, { headers });
    const playlistsData = await res.json();
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
    const res = await fetch(`${SPOTIFY_API}/me/tracks?limit=${limit}&offset=${offset}`, { headers });
    const tracksData = await res.json();
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

export const getPlaylistByName = async (token, userId, name) => {
  const playlists = await getPlaylists(token, userId);
  const simple = playlists.find((playlist) => playlist.name === name);
  if (!simple) return null;
  return getPlaylist(token, userId, simple.id);
}

export const getUser = async (accessToken: string ) => {
  const headers = {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  };
  const res = await fetch(`${SPOTIFY_API}/me`, { headers });
  return res.json();
};

export const replacePlaylistTracks = async (accessToken: string, playlistId: string, uris) => {
  const headers = {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  };

  await fetch(`${SPOTIFY_API}/playlists/${playlistId}/tracks`, { body: JSON.stringify({ uris }), headers, method: "PUT" });
};

export const putPlaylistImage = async (accessToken: string, playlistId: string, image: string) => {
  const headers = {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "image/jpeg"
  };
  await fetch( `${SPOTIFY_API}/playlists/${playlistId}/images`, { body: image, headers, method: "PUT" });
};


export const updatePlaylist = async (accessToken, userId, playlistId, options) => {
  const { size } = options;

  try {
    const tracks = await getRecentlyLikedTracks(accessToken, size);
    await replacePlaylistTracks(accessToken, playlistId, tracks.map(({ uri }) => uri));

    return await getPlaylist(accessToken, userId, playlistId);

  } catch (e: any) {
    let msg = e;
    if (e.response) {
      const { data, status, statusText } = e.response;
      msg = `${status}: "${statusText}" ${data}`;
    }
    console.log(`Failed to update user [${userId}] spotify - ${msg}`);
    return null;
  }
};
