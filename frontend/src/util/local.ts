export const PLAYLIST_NAME_KEY = "playlistName";
export const PLAYLIST_SIZE_KEY = "playlistSize";

export const getLocal = (key: string, defaultValue?: any) => {
  const value = window.localStorage.getItem(key);
  return value ? JSON.parse(value) : defaultValue;
};

export const setLocal = (key: string, value: any) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};
