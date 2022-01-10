export const downloadImage = (url: string) => {
  return fetch(url)
    .then((res) => res.arrayBuffer())
    // .then((buffer) => Buffer.from(buffer, 'binary'));
};


// export const resizeImageBuffer = async (buffer, width, height): Promise<Buffer> => sharp(buffer).resize(width, height).jpeg().toBuffer();