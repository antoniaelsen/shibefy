import config from "../../config";

export const getShibe = async () => {
  const res = await fetch(`https://${config.backendDomain}/shibe`);
  const { image: base64 } = await res.json();
  return base64;
};