import { Request as ExpressRequest } from "express";

export type ConnectionTokens = {
  accessToken: string;
  refreshToken: string;
};

export interface Request extends ExpressRequest {
  user?: {
    id?: string,
    tokens?: ConnectionTokens,
  },
  session?: {
    returnTo?: string;
  },
  sessionID?: any;
}