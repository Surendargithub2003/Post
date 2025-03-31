import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  userData?: { email: string; userId: string };
}

const checkAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; 
    console.log(req.headers.authorization)
    if (!token) {
      res.status(401).json({ message: "Auth Failed!" });
      return; 
    }
    const secretKey = process.env['JWT_KEY'];
    const decodedToken = jwt.verify(token, secretKey as string) as JwtPayload;
    req.userData = {email: decodedToken["email"] , userId : decodedToken["userId"]}
    next(); 
  } catch (error) {
    res.status(401).json({ message: "You are not authenticated!" });
    return;
  }
};

export default checkAuth;