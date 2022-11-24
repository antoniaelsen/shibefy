import config from "../config";

export const SPOTIFY_API = "https://api.spotify.com/v1";
export const PROXY_API = `https://${config.backendDomain}/rproxy/spotify/v1`;


const decodeHtml = (html) => {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const proxy = (url) => {
  return url.replace(SPOTIFY_API, PROXY_API)
}

const requestParams = (contentType: string = "application/json") => ({
  credentials: "include" as RequestCredentials,
  headers: {
    "Content-Type": contentType,
  }
});

export const createPlaylist = async (userId: string, name: string) => {
  const params = requestParams();

  const body = JSON.stringify({
    name,
    description: "https://shibefy.com",
    public: true
  });
  const res = await fetch(`${PROXY_API}/users/${userId}/playlists`, { ...params, method: "POST", body });
  return res.json();
};

export const getPlaylist = async (playlistId: string) => {
  const params = requestParams();

  let items: any[] = [];
  const res = await fetch(`${PROXY_API}/playlists/${playlistId}`, params);
  const playlist = await res.json();
  items.push(...playlist.tracks.items);

  let next = playlist.tracks.next;
  while (!!next) {
    const res = await fetch(proxy(next), params);
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

export const getPlaylists = async (userId: string) => {
  const params = requestParams();

  const limit = 50;
  let next = `${PROXY_API}/users/${userId}/playlists?limit=${limit}`;
  const playlists: any = [];
  while (next) {
    const res = await fetch(proxy(next), params);
    const playlistsData = await res.json();

    playlists.push(...playlistsData.items);
    next = playlistsData.next;
  }

  return playlists;
};

export const getRecentlyLikedTracks = async (size) => {
  const params = requestParams();

  let remaining = 1;
  let offset = 0;
  const limit = 50;
  const tracks: any = [];
  while (remaining !== 0) {
    const res = await fetch(`${PROXY_API}/me/tracks?limit=${limit}&offset=${offset}`, params);
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

export const getPlaylistByName = async (userId, name) => {
  const playlists = await getPlaylists(userId);
  const simple = playlists
  .filter(({ owner }) => owner.id === userId)
  .find((playlist) => playlist.name === name);

  if (!simple) return null;
  return getPlaylist(simple.id);
}

export const getUser = async () => {
  const params = requestParams();
  const res = await fetch(`${PROXY_API}/me`, params);
  return res.json();
};

export const addPlaylistTracks = async (playlistId: string, position: number, uris) => {
  const params = requestParams();
  await fetch(
    `${PROXY_API}/playlists/${playlistId}/tracks`,
    { ...params, body: JSON.stringify({ uris, position }), method: "POST" }
  );
};

export const replacePlaylistTracks = async (playlistId: string, uris) => {
  const params = requestParams();
  await fetch(`${PROXY_API}/playlists/${playlistId}/tracks`, { ...params, body: JSON.stringify({ uris }), method: "PUT" });
};

export const putPlaylistImage = async (playlistId: string, image: string) => {
  const params = requestParams("image/jpeg");
  await fetch( `${PROXY_API}/playlists/${playlistId}/images`, { ...params, body: image, method: "PUT" });
};


export const updatePlaylist = async (userId: string, playlistId: string, options) => {
  const { size } = options;
  const limit = 100;
  let position = 0;
  let batch = [];

  try {
    const tracks = await getRecentlyLikedTracks(size);
    const uris = tracks.map(({ uri }) => uri);
    await replacePlaylistTracks(playlistId, batch);

    do {
      batch = uris.slice(position, position + limit)
      await addPlaylistTracks(playlistId, position, batch);
      position += limit;
    }
    while (position < size);

    return await getPlaylist(playlistId);

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
