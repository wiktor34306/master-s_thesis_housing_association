import jwt from "jsonwebtoken";
import config from "../config";
import TokenDAO from "../DAO/tokenDAO";

const admin = async (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    req.user = jwt.verify(token, config.JwtSecret);

    const userRole = await TokenDAO.getUserRole(req.user.user_id);
    req.user.role = userRole;

    if (req.user.role !== 'admin') {
        return res.status(403).send('Access denied.');
      }

    next();
  } catch (ex) {
    res.status(400).send('Invalid token.');
  }
};

export default admin;
