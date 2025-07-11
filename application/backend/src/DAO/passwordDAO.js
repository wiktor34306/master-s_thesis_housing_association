const pool = require("../../db");
const bcrypt = require('bcrypt');

async function createPassword(userInfo, hashedPassword) {
  try {
    const addUserQuery = `
      INSERT INTO housing_association."user" 
        (first_name, surname, email_address, role, housing_association_id) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING user_id
    `;

    const addUserValues = [
      userInfo.first_name,
      userInfo.surname,
      userInfo.email_address,
      userInfo.role,
      userInfo.housing_association_id || 1
    ];
    const userResult = await pool.query(addUserQuery, addUserValues);
    const userId = userResult.rows[0].user_id;

    const addPasswordQuery = `
      INSERT INTO housing_association.password (user_id, password) 
      VALUES ($1, $2) RETURNING *
    `;
    const addPasswordValues = [userId, hashedPassword];
    const passwordResult = await pool.query(addPasswordQuery, addPasswordValues);

    return { user: userResult.rows[0], password: passwordResult.rows[0] };
  } catch (error) {
    console.error('Error creating user and password:', error);
    throw error;
  }
}

async function authorize(userId, hashedPassword) {
  const query = `
    SELECT password_id 
    FROM housing_association.password 
    WHERE user_id = $1 AND password = $2
  `;
  const values = [userId, hashedPassword];
  const result = await pool.query(query, values);
  return result.rows.length > 0;
}

async function verifyPassword(userId, providedPassword) {
  const query = `
    SELECT password 
    FROM housing_association.password 
    WHERE user_id = $1
  `;
  const values = [userId];
  const result = await pool.query(query, values);

  if (result.rows.length > 0) {
    const storedHashedPassword = result.rows[0].password;
    const isPasswordValid = await bcrypt.compare(providedPassword, storedHashedPassword);
    return isPasswordValid;
  }
  return false;
}

module.exports = {
  createPassword,
  authorize,
  verifyPassword,
};
