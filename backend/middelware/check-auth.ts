import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  userData?: { email: string; userId: string };
}

const checkAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Please login to continue." });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Please login to continue." });
      return;
    }

    const secretKey = process.env['JWT_KEY'];
    const decodedToken = jwt.verify(token, secretKey as string) as JwtPayload;

    req.userData = {
      email: decodedToken["email"],
      userId: decodedToken["userId"]
    };

    next(); // Proceed if authenticated
  } catch (error) {
    res.status(401).json({ message: "Session expired or invalid token. Please login again." });
  }
};


export default checkAuth;