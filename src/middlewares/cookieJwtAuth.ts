import jwt from "jsonwebtoken";
import { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

exports.cookieJwtAuth = (req: Request, res: Response) => {
  const token = req.cookies.token;
  const MY_SECRET = process.env.MY_SECRET;
  try {
    const user = jwt.verify(token, MY_SECRET as string);
    //req.user = user;

  } catch (err) {
    res.clearCookie("token");
    return res.redirect("/");
  }
};