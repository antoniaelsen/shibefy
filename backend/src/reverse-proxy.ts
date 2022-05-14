import { Response, Router } from "express";
import { Request } from "types/Request";
import ExpressHttpProxy from 'express-http-proxy';
import config from "./config";
import { logger as rootLogger } from './util/logger';


const services = [
  { service: "spotify", url: "https://api.spotify.com/v1" }
];

const createReverseProxy = (service: string, url: string, { config, logger: rootLogger }) => {
  const logger = rootLogger.child({ labels: [`proxy-${service}`] });

  const getToken = (req: Request) => {
    return req.user?.tokens?.accessToken;
  }

  const proxyReqOptDecorator = (proxyReqOpts: any, req: Request) => {
    const token = getToken(req);
    if (!token) {
      logger.error(`[${req.sessionID}] [${req.user?.id}] Failed to apply token to proxied request`);
    }
    logger.info(`[${req.sessionID}] [${req.user?.id}] Proxying request to ${req.path}`);
    proxyReqOpts.headers['Authorization'] = `Bearer ${token}`;
    return proxyReqOpts;
  };

  const userResHeaderDecorator = (headers, userReq: Request, userRes: Response, proxyReq: Request, proxyRes: Response) => {
    return {
      ...headers,
      "Access-Control-Allow-Origin": `https://${config.frontendDomain}`
    };
  };

  return ExpressHttpProxy(url, { proxyReqOptDecorator, userResHeaderDecorator });
};


const createReverseProxyMiddleware = () => {
  const router = Router();
  services.forEach(({ service, url }) => {
    router.use(`/${service}`, createReverseProxy(service, url, { config, logger: rootLogger }));
  });

  return router;
};

export default createReverseProxyMiddleware;
