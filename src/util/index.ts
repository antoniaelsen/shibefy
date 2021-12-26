import axios from "axios";

export const downloadImage = (url: string) => {
  return axios
    .get(url, {
      responseType: 'arraybuffer'
    })
    .then(response => Buffer.from(response.data, 'binary'));
};
