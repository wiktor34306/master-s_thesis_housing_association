const express = require("express");
const app = express();
import pool from "../../db";
import admin from '../middleware/admin';
import auth from "../middleware/auth";

const userEndpoint = (app) => {
   app.get("/get-all-users", auth(["administrator","worker"]), async (req, res) => {
    try {
      const adminUserId = req.user.user_id;
      
      const adminResult = await pool.query(
        `SELECT housing_association_id 
        FROM housing_association."user" 
        WHERE user_id = $1`, 
        [adminUserId]
      );

      if (adminResult.rows.length === 0) {
        return res.status(404).json({ error: "Nie znaleziono danych administratora." });
      }

      const adminHAId = adminResult.rows[0].housing_association_id;

      let query = `
        SELECT 
          u.user_id, 
          u.first_name, 
          u.surname, 
          u.email_address, 
          u.role, 
          ha.name, 
          r.street, 
          r.building_number, 
          r.apartment_number, 
          r.phone_number 
        FROM housing_association."user" u
        LEFT JOIN housing_association.housing_association ha 
          ON ha.housing_association_id = u.housing_association_id
        LEFT JOIN housing_association.resident r
          ON r.user_id = u.user_id
      `;
      let params = [];

      if (adminHAId) {
        query += " WHERE u.housing_association_id = $1";
        params.push(adminHAId);
      }

      const users = await pool.query(query, params);
      res.json(users.rows);
    } catch (error) {
      console.error("Błąd przy pobieraniu użytkowników:", error);
      res.status(500).json({ error: "Błąd pobierania danych" });
    }
  });

  app.get("/get-based-info-about-user", auth(["administrator", "worker"]), async (req, res) => {
    try {
      const { user_id } = req.user;
      const query = `
        SELECT user_id, role, first_name, surname, email_address, housing_association_id
        FROM housing_association."user"
        WHERE user_id = $1
      `;
      const result = await pool.query(query, [user_id]);
      
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Błąd przy pobieraniu użytkowników:", error);
      res.status(500).json({ error: "Błąd pobierania danych" });
    }
  });

  app.put("/update-user/:user_id", auth(["administrator", "worker", "resident"]), async (req, res) => {
    try {
      const { user_id } = req.params;
      const {
        first_name,
        surname,
        email_address,
        role,
        housing_association_id,
        street,
        building_number,
        apartment_number,
        phone_number
      } = req.body;

      const updateUserQuery = `
        UPDATE housing_association."user"
        SET first_name = $1,
            surname = $2,
            email_address = $3,
            role = $4,
            housing_association_id = $5
        WHERE user_id = $6
        RETURNING user_id;
      `;
      const userUpdateResult = await pool.query(updateUserQuery, [first_name, surname, email_address, role, housing_association_id, user_id]);

      if (role === 'resident') {
        const updateResidentQuery = `
          UPDATE housing_association.resident
          SET street = $1,
              building_number = $2,
              apartment_number = $3,
              phone_number = $4
          WHERE user_id = $5
          RETURNING resident_id;
        `;
        const residentResult = await pool.query(updateResidentQuery, [street, building_number, apartment_number, phone_number, user_id]);

        if (residentResult.rows.length === 0) {
          const insertResidentQuery = `
            INSERT INTO housing_association.resident (user_id, street, building_number, apartment_number, phone_number)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING resident_id;
          `;
          const insertResult = await pool.query(insertResidentQuery, [user_id, street, building_number, apartment_number, phone_number]);
        }
      }

      res.json({ message: "Użytkownik został zaktualizowany pomyślnie." });
    } catch (error) {
      console.error("Błąd podczas aktualizacji użytkownika:", error);
      res.status(500).json({ error: "Błąd podczas aktualizacji użytkownika." });
    }
  });


  app.delete("/delete-user/:id", auth(["administrator","worker"]), async (req, res) => {
    try {
      const { id } = req.params;
      const userResult = await pool.query(
        `SELECT * FROM housing_association."user" WHERE user_id = $1`,
        [id]
      );
      
      if (userResult.rows.length === 0) {
        return res.status(400).json({ error: "Nie znaleziono użytkownika o podanym ID." });
      }
      const userRecord = userResult.rows[0];

      const deletePasswordResult = await pool.query(`DELETE FROM housing_association.password WHERE user_id = $1`, [id]);
      const deleteTokenResult = await pool.query(`DELETE FROM housing_association.token WHERE user_id = $1`, [id]);

      const deleteDocumentResult = await pool.query(`DELETE FROM housing_association.document WHERE user_id = $1`, [id]);

      if (userRecord.role === 'resident') {
        const deleteResidentResult = await pool.query(`DELETE FROM housing_association.resident WHERE user_id = $1`, [id]);
      }

      const deleteUserResult = await pool.query(`DELETE FROM housing_association."user" WHERE user_id = $1`, [id]);

      res.json({ message: "Użytkownik został usunięty pomyślnie." });
    } catch (error) {
      console.error("Błąd przy usuwaniu użytkownika:", error);
      res.status(500).json({ error: "Błąd serwera." });
    }
  });
  
};

export default userEndpoint;