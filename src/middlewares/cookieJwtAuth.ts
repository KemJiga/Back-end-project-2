import jwt from "jsonwebtoken";
import { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

function getCookie(cname: string, req: Request) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(req.cookies);
    console.log(decodedCookie); 
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

exports.cookieJwtAuth = (req: Request, res: Response) => {
  const token = getCookie("token", req) ;
  console.log(token);
  const MY_SECRET = process.env.MY_SECRET;
  try {
    const user = jwt.verify(token, MY_SECRET as string);
    console.log(user);
    return true;
  } catch (err) {
    res.clearCookie("token");
    return false;
  }
};

export default exports;