import axios from 'axios';
import { Router } from 'express';
import sharp from 'sharp';
 
const SPOTIFY_IMAGE_SIZE = 300;

export const downloadImage = (url: string) => {
  return axios
    .get(url, {
      responseType: 'arraybuffer'
    })
    .then(response => Buffer.from(response.data, 'binary'));
};

const createImageMiddleware = () => {
  const router = Router();

  router.get(
    '/shibe',
    async (req, res) => {
      const { data } = await axios.get("http://shibe.online/api/shibes");
      const url = data[0];

      // Download image, convert to base 64
      let buffer = await downloadImage(url);
      buffer = await sharp(buffer).resize(SPOTIFY_IMAGE_SIZE, SPOTIFY_IMAGE_SIZE).jpeg().toBuffer();
      const image: string = buffer.toString("base64");
      res.send(JSON.stringify({ image }));
    }
  );
  
  return router;
};

export default createImageMiddleware;