import jwt from 'jsonwebtoken';
import config from '../config';
import { jwtDecode } from "jwt-decode";

const auth = (role) => {
  
return async (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    if (!token) {
      return res.status(401).send('Access denied. No token provided.');
    }

  try {
    const validate = jwt.verify(token, config.JwtSecret);  
    const decodedToken = jwtDecode(token);
    if (role.includes(decodedToken.role)) {
      req.user = decodedToken;
      next();
    } else {
      res.status(403).send('Forbidden. Incorrect role.');
    }
  
  } catch (ex) {
    if (ex.name === 'TokenExpiredError') {
      res.status(401).send('Unauthorized. Token expired.');
    } else if (ex.name === 'JsonWebTokenError') {
      res.status(400).send(`Bad Request. Invalid token. Details: ${ex.message}`);
    } else {
      res.status(500).send('Internal Server Error');
    }
  }
}
}
  
export default auth;