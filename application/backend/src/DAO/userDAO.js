const pool = require('../../db');

async function getUserByEmail(email) {
  const query = `
    SELECT u.user_id, u.email_address, u.role, p.password, u.first_name, u.surname 
    FROM housing_association."user" u 
    INNER JOIN housing_association.password p ON u.user_id = p.user_id 
    WHERE u.email_address = $1
  `;
  const values = [email];

  try {
    const result = await pool.query(query, values);
    const user = result.rows[0];
    return user;
  } catch (error) {
    console.error('getUserByEmail - Error:', error);
    throw error;
  }
}

async function createNewUser(userData) {
  const query = `
    INSERT INTO housing_association."user" 
      (first_name, surname, email_address, role, housing_association_id) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING user_id
  `;
  const values = [
    userData.first_name,
    userData.surname,
    userData.email_address,
    userData.role,
    userData.housing_association_id || 1
  ];

  try {
    const result = await pool.query(query, values);
    const userId = result.rows[0].user_id;

    const passwordQuery = `
      INSERT INTO housing_association.password (user_id, password) 
      VALUES ($1, $2)
    `;
    const passwordValues = [userId, userData.password];
    await pool.query(passwordQuery, passwordValues);

    return userId;
  } catch (error) {
    console.error('createNewUser - Error:', error);
    throw error;
  }
}

async function authorize(email, password) {
  const query = `
    SELECT u.user_id, u.email_address, u.role 
    FROM housing_association."user" u 
    INNER JOIN housing_association.password p ON u.user_id = p.user_id 
    WHERE u.email_address = $1 AND p.password = $2
  `;
  const values = [email, password];

  try {
    const result = await pool.query(query, values);
    if (result.rows.length > 0) {
      return result.rows[0];
    }
    return null;
  } catch (error) {
    console.error('authorize - Error:', error);
    throw error;
  }
}

async function updateUser(userId, userData) {
  const query = `
    UPDATE housing_association."user" 
    SET email_address = $1, role = $2, first_name = $3, surname = $4 
    WHERE user_id = $5 
    RETURNING *
  `;
  const values = [
    userData.email_address,
    userData.role,
    userData.first_name,
    userData.surname,
    userId,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('updateUser - Error:', error);
    throw error;
  }
}

async function deleteUser(userId) {
  try {
    let query = `
      DELETE FROM housing_association.password WHERE user_id = $1
    `;
    let values = [userId];
    await pool.query(query, values);

    query = `
      DELETE FROM housing_association."user" WHERE user_id = $1
    `;
    values = [userId];
    await pool.query(query, values);
  } catch (error) {
    console.error('deleteUser - Error:', error);
    throw error;
  }
}

module.exports = {
  getUserByEmail,
  createNewUser,
  authorize,
  updateUser,
  deleteUser,
};
