export const SPOTIFY_API = "https://api.spotify.com/v1";

const decodeHtml = (html) => {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

const createHeaders = (token: string, contentType: string = "application/json") => ({
  "Authorization": `Bearer ${token}`,
  "Content-Type": contentType
});

export const createPlaylist = async (accessToken: string, userId: string, name: string) => {
  const headers = createHeaders(accessToken);

  const body = JSON.stringify({
    name,
    description: "https://shibefy.com",
    public: true
  });
  const res = await fetch(`${SPOTIFY_API}/users/${userId}/playlists`, { method: "POST", body, headers });
  return res.json();
};

export const getPlaylist = async (accessToken: string, playlistId: string) => {
  const headers = createHeaders(accessToken);

  let items: any[] = [];
  const res = await fetch(`${SPOTIFY_API}/playlists/${playlistId}`, { headers });
  const playlist = await res.json();
  items.push(...playlist.tracks.items);

  let next = playlist.tracks.next;
  while (!!next) {
    const res = await fetch(`${next}`, { headers });
    const tracksData = await res.json();
    next = tracksData.next;
    items.push(...tracksData.items);
  }
  return {
    ...playlist,
    description: decodeHtml(playlist.description),
    tracks: {
      items
    }
  };
};

export const getPlaylists = async (accessToken: string, userId: string) => {
  const headers = createHeaders(accessToken);

  let next = `${SPOTIFY_API}/users/${userId}/playlists`;
  const playlists: any = [];
  while (next) {
    const res = await fetch(next, { headers });
    const playlistsData = await res.json();

    playlists.push(...playlistsData.items);
    next = playlistsData.next;
  }

  return playlists;
};

export const getRecentlyLikedTracks = async (accessToken: string, size) => {
  const headers = createHeaders(accessToken);

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
  const simple = playlists
  .filter(({ owner }) => owner.id === userId)
  .find((playlist) => playlist.name === name);

  if (!simple) return null;
  return getPlaylist(token, simple.id);
}

export const getUser = async (accessToken: string ) => {
  const headers = createHeaders(accessToken);
  const res = await fetch(`${SPOTIFY_API}/me`, { headers });
  return res.json();
};

export const addPlaylistTracks = async (accessToken: string, playlistId: string, position: number, uris) => {
  const headers = createHeaders(accessToken);
  await fetch(
    `${SPOTIFY_API}/playlists/${playlistId}/tracks`,
    { body: JSON.stringify({ uris, position }), headers, method: "POST" }
  );
};

export const replacePlaylistTracks = async (accessToken: string, playlistId: string, uris) => {
  const headers = createHeaders(accessToken);
  await fetch(`${SPOTIFY_API}/playlists/${playlistId}/tracks`, { body: JSON.stringify({ uris }), headers, method: "PUT" });
};

export const putPlaylistImage = async (accessToken: string, playlistId: string, image: string) => {
  const headers = createHeaders(accessToken, "image/jpeg");
  await fetch( `${SPOTIFY_API}/playlists/${playlistId}/images`, { body: image, headers, method: "PUT" });
};


export const updatePlaylist = async (accessToken, userId, playlistId, options) => {
  const { size } = options;
  const limit = 100;
  let position = 0;
  let batch = [];

  try {
    const tracks = await getRecentlyLikedTracks(accessToken, size);
    const uris = tracks.map(({ uri }) => uri);
    await replacePlaylistTracks(accessToken, playlistId, batch);

    do {
      batch = uris.slice(position, position + limit)
      await addPlaylistTracks(accessToken, playlistId, position, batch);
      position += limit;
    }
    while (position < size);

    return await getPlaylist(accessToken, playlistId);

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
