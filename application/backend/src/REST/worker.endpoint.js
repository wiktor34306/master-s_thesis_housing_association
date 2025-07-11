import pool from "../../db";
import auth from "../middleware/auth";
import bcrypt from "bcrypt";

const workerEndpoint = (app) => {
  app.post("/worker-registration", auth(["administrator","worker"]), async (req, res) => {
    const { 
      first_name,
      surname,
      email_address,
      password,               
      housing_association_id
    } = req.body;
    
    try {
      const existingUser = await pool.query(
        `SELECT * FROM housing_association."user" WHERE email_address = $1`,
        [email_address]
      );
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: "Użytkownik o podanym adresie e-mail już istnieje." });
      }
      
      const userInsertResult = await pool.query(
        `INSERT INTO housing_association."user" 
          (first_name, surname, email_address, role, housing_association_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING user_id`,
        [first_name, surname, email_address, 'worker', housing_association_id]
      );
      
      const user_id = userInsertResult.rows[0].user_id;
      
      if (password) {
        const saltRound = 12;
        const salt = await bcrypt.genSalt(saltRound);
        const bcryptPassword = await bcrypt.hash(password, salt);
        await pool.query(
          `INSERT INTO housing_association.password (user_id, password)
           VALUES ($1, $2)`,
          [user_id, bcryptPassword]
        );
      }
      
      res.status(201).json({
        message: "Rekord pracownika dodany pomyślnie.",
        user_id: user_id
      });
      
    } catch (error) {
      console.error("Błąd przy rejestracji pracownika:", error);
      res.status(500).json({ error: "Błąd przy rejestracji pracownika." });
    }
  });

    app.get("/get-information-about-worker", auth(["worker"]), async (req, res) => {
    try {
      const { user_id } = req.user;

      const result = await pool.query(
        `SELECT * FROM housing_association."user" WHERE user_id = $1`,
        [user_id]
      );
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Błąd przy pobieraniu użytkowników:", error);
      res.status(500).json({ error: "Błąd pobierania danych" });
    }
  });

    app.put("/edit-information-about-worker", auth(["worker"]), async (req, res) => {
  try {
    const { user_id } = req.user;
    const { first_name, surname} = req.body;

    if (!first_name || !surname) {
      return res.status(400).json({ error: "Nie podano wymaganych danych (first_name, surname)." });
    }

    const updateQuery = `
      UPDATE housing_association."user"
      SET first_name = $1,
          surname = $2
      WHERE user_id = $3
      RETURNING *
    `;
    const values = [first_name, surname, user_id];

    const result = await pool.query(updateQuery, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono użytkownika." });
    }
    res.json({
      message: "Dane pracownika zostały zaktualizowane.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Błąd przy edytowaniu danych pracownika:", error);
    res.status(500).json({ error: "Błąd edytowania danych" });
  }
});

};

export default workerEndpoint;
