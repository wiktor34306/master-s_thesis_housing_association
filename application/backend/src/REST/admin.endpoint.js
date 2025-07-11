const bcrypt = require("bcrypt");
import pool from "../../db";
import auth from "../middleware/auth";

const adminEndpoint = (app) => {
    app.post("/administrator-registration", auth(["administrator"]), async (req, res) => {
      const { imie, nazwisko, adres_email, haslo } = req.body;
      const housingAssociationId = req.body.housing_association_id;
  
      try {
        const existingAdmin = await pool.query(
          `SELECT * FROM housing_association."user" WHERE email_address = $1`,
          [adres_email]
        );
  
        if (existingAdmin.rows.length > 0) {
          return res.status(400).json({
            error: "Administrator o podanym adresie e-mail już istnieje."
          });
        }
  
        const saltRound = 12;
        const salt = await bcrypt.genSalt(saltRound);
        if (!haslo || !salt) {
          console.error("Brak hasła lub soli do haszowania.");
          return res.status(400).json({ error: "Brak hasła lub soli do haszowania." });
        }
        const bcryptPassword = await bcrypt.hash(haslo, salt);
  
        const adminRegister = await pool.query(
          `INSERT INTO housing_association."user" 
            (first_name, surname, email_address, role, housing_association_id) 
           VALUES ($1, $2, $3, $4, $5) 
           RETURNING user_id`,
          [imie, nazwisko, adres_email, "administrator", housingAssociationId]
        );
  
        await pool.query(
          `INSERT INTO housing_association.password (user_id, password) 
           VALUES ($1, $2) RETURNING *`,
          [adminRegister.rows[0].user_id, bcryptPassword]
        );
  
        console.log("Dodano nowego administratora do bazy danych:", imie, nazwisko);
  
        res.status(201).json({
          message: "Administrator zarejestrowany pomyślnie."
        });
      } catch (error) {
        console.error("Błąd przy rejestrowaniu: ", error);
        res.status(500).json({
          error: "Błąd rejestracji. Sprawdź, czy dane się nie duplikują (adres e-mail musi być unikatowy)"
        });
      }
    });

  app.get("/get-information-about-admin", auth(["administrator"]), async (req, res) => {
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

  app.put("/edit-information-about-admin", auth(["administrator"]), async (req, res) => {
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
      message: "Dane administratora zostały zaktualizowane.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Błąd przy edytowaniu danych administratora:", error);
    res.status(500).json({ error: "Błąd edytowania danych" });
  }
});

  };
  
  export default adminEndpoint;