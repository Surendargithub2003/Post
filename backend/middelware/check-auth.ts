import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const checkAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; 
    if (!token) {
      res.status(401).json({ message: "Auth Failed!" });
      return; 
    }
    jwt.verify(token, "secret_this_should_be_longer");
    next(); 
  } catch (error) {
    res.status(401).json({ message: "Auth Failed!" });
    return; 
  }
};

export default checkAuth;
