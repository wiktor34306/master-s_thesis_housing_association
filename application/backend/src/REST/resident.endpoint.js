import pool from "../../db";
import auth from "../middleware/auth";
import bcrypt from "bcrypt";

const residentEndpoint = (app) => {
  app.post("/resident-registration", auth(["administrator","worker"]), async (req, res) => {
    const { 
      first_name,
      surname,
      email_address,
      password,               
      housing_association_id,
      street,
      building_number,
      apartment_number,
      phone_number 
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
        [first_name, surname, email_address, 'resident', housing_association_id]
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
      
      const residentInsertResult = await pool.query(
        `INSERT INTO housing_association.resident (user_id, street, building_number, apartment_number, phone_number)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING resident_id`,
        [user_id, street, building_number, apartment_number, phone_number]
      );
      
      res.status(201).json({
        message: "Rekord mieszkańca dodany pomyślnie.",
        user_id: user_id,
        resident_id: residentInsertResult.rows[0].resident_id
      });
      
    } catch (error) {
      console.error("Błąd przy rejestracji mieszkańca:", error);
      res.status(500).json({ error: "Błąd przy rejestracji mieszkańca." });
    }
  });

  app.get("/all-residents", auth(["administrator"]), async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT r.resident_id, r.user_id, r.street, r.building_number, r.apartment_number, r.phone_number,
                u.first_name, u.surname, u.email_address, u.housing_association_id
         FROM housing_association.resident r
         JOIN housing_association."user" u ON r.user_id = u.user_id`
      );
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Błąd przy pobieraniu mieszkańców:", error);
      res.status(500).json({ error: "Błąd przy pobieraniu mieszkańców." });
    }
  });

  app.get("/residents/:housing_association_id", auth(["administrator","worker"]), async (req, res) => {
    const housingAssociationId = req.params.housing_association_id;
    try {
      const result = await pool.query(
        `SELECT r.resident_id,
                r.user_id,
                r.street,
                r.building_number,
                r.apartment_number,
                r.phone_number,
                u.first_name,
                u.surname,
                u.email_address,
                u.housing_association_id
         FROM housing_association.resident r
         JOIN housing_association."user" u ON r.user_id = u.user_id
         WHERE u.housing_association_id = $1`,
         [housingAssociationId]
      );
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Błąd przy pobieraniu mieszkańców spółdzielni:", error);
      res.status(500).json({ error: "Błąd przy pobieraniu mieszkańców spółdzielni." });
    }
  });

  app.get("/residents-by-user-id", auth(["administrator", "resident", "worker"]), async (req, res) => {
  try {
    const { user_id } = req.user;
    const userQuery = await pool.query(
      `SELECT housing_association_id 
       FROM housing_association."user" 
       WHERE user_id = $1`,
      [user_id]
    );
    
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono danych użytkownika." });
    }

    const housingAssociationId = userQuery.rows[0].housing_association_id;

    if (!housingAssociationId) {
      return res.status(200).json({ 
        housing_association: null, 
        message: "Użytkownik nie ma przypisanej spółdzielni." 
      });
    }

    const residentsResult = await pool.query(
      `SELECT r.resident_id,
              r.user_id,
              r.street,
              r.building_number,
              r.apartment_number,
              r.phone_number,
              u.first_name,
              u.surname,
              u.email_address,
              u.housing_association_id
       FROM housing_association.resident r
       JOIN housing_association."user" u ON r.user_id = u.user_id
       WHERE u.housing_association_id = $1`,
       [housingAssociationId]
    );
        
    res.status(200).json(residentsResult.rows);
  } catch (error) {
    console.error("Błąd przy pobieraniu mieszkańców spółdzielni:", error);
    res.status(500).json({ error: "Błąd przy pobieraniu mieszkańców spółdzielni." });
  }
});


  app.get("/information-about-resident", auth(["resident"]), async (req, res) => {
  try {
    const { user_id } = req.user;

    const query = `
      SELECT 
        r.resident_id,
        r.user_id,
        r.street,
        r.building_number,
        r.apartment_number,
        r.phone_number,
        u.first_name,
        u.surname,
        u.email_address,
        u.housing_association_id
      FROM housing_association.resident r
      JOIN housing_association."user" u ON r.user_id = u.user_id
      WHERE u.user_id = $1
    `;
    const result = await pool.query(query, [user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono danych mieszkańca." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Błąd przy pobieraniu danych mieszkańca:", error);
    res.status(500).json({ error: "Błąd pobierania danych mieszkańca." });
  }
});


app.put("/edit-information-about-resident/:resident_id", auth(["resident"]), async (req, res) => {
  const resident_id = req.params.resident_id;
  const { phone_number, first_name, surname } = req.body;
  
  try {
    const residentUpdate = await pool.query(
      `UPDATE housing_association.resident
       SET phone_number = COALESCE($1, phone_number)
       WHERE resident_id = $2
       RETURNING *`,
      [phone_number, resident_id]
    );
    
    if (residentUpdate.rows.length === 0) {
      return res.status(404).json({ error: "Rekord mieszkańca nie został znaleziony." });
    }
    
    const user_id = residentUpdate.rows[0].user_id;
    
    if (first_name || surname) {
      await pool.query(
        `UPDATE housing_association."user"
         SET first_name = COALESCE($1, first_name),
             surname = COALESCE($2, surname)
         WHERE user_id = $3`,
        [first_name, surname, user_id]
      );
    }
    
    const fullData = await pool.query(
      `SELECT 
          r.resident_id,
          r.user_id,
          r.street,
          r.building_number,
          r.apartment_number,
          r.phone_number,
          u.first_name,
          u.surname,
          u.email_address,
          u.housing_association_id
       FROM housing_association.resident r
       JOIN housing_association."user" u ON r.user_id = u.user_id
       WHERE r.resident_id = $1`,
       [resident_id]
    );
    
    res.status(200).json({
      message: "Rekord mieszkańca zaktualizowany pomyślnie.",
      resident: fullData.rows[0]
    });
  } catch (error) {
    console.error("Błąd przy aktualizacji rekordu mieszkańca:", error);
    res.status(500).json({ error: "Błąd przy aktualizacji rekordu mieszkańca." });
  }
});


};

export default residentEndpoint;
