import jwt from 'jsonwebtoken';
import config from '../config';
import applicationException from '../service/applicationException';
import pool from '../../db';

async function createToken(user) {
  if (!config.JwtSecret) {
    throw new Error('Secret key is missing');
  }

  const payload = {
    user_id: user.user_id,
    role: user.role,
    first_name: user.first_name
  };

  const token = jwt.sign(payload, config.JwtSecret, { expiresIn: '1h' });

  const date = new Date();
  const offset = date.getTimezoneOffset();
  date.setMinutes(date.getMinutes() - offset);

  await pool.query(
    `INSERT INTO housing_association.token (user_id, date_of_creation, type, token_value)
     VALUES ($1, $2, $3, $4);`,
    [payload.user_id, date.toISOString(), 'auth', token]
  );

  return token;
}

function verifyToken(token) {
  try {
    if (!config.JwtSecret) {
      throw new Error('Secret key is missing');
    }
    const payload = jwt.verify(token, config.JwtSecret);
    return payload;
  } catch (error) {
    throw applicationException.new(applicationException.UNAUTHORIZED, 'Invalid token');
  }
}

function generateToken(user) {
  if (!config.JwtSecret) {
    throw applicationException.new(applicationException.UNAUTHORIZED, 'Secret key is missing');
  }

  const payload = {
    user_id: user.user_id,
    role: user.role,
    first_name: user.first_name
  };

  const token = jwt.sign(payload, config.JwtSecret, { expiresIn: '1h' });
  return token;
}

  async function remove(tokenValue) {
    const queryText = "DELETE FROM housing_association.token WHERE token_value = $1;";
    try {
      const result = await pool.query(queryText, [tokenValue]);
      return result;
    } catch (error) {
      console.error('Błąd podczas usuwania tokena:', error);
      throw error;
    }
  }


module.exports = {
  createToken,
  verifyToken,
  generateToken,
  remove
};
