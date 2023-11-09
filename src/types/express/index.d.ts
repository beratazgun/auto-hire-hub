declare global {
  namespace Express {
    interface Request {
      cookies: {
        sesID: string;
      };
    }
  }
}
