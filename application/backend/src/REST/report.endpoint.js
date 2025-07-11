import pool from "../../db";
import auth from "../middleware/auth";

const reportEndpoint = (app) => {
app.post("/add-report", auth(["resident"]), async (req, res) => {
  try {
    const { user_id } = req.user;
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Brak wymaganych pól: title i description." });
    }
    
    const userResult = await pool.query(
      `SELECT housing_association_id 
       FROM housing_association."user" 
       WHERE user_id = $1`,
      [user_id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono użytkownika." });
    }
    
    const status = "to_do"; 
    const is_it_done = false;
    
    const result = await pool.query(
      `INSERT INTO housing_association.report (user_id, title, description, status, is_it_done)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, title, description, status, is_it_done]
    );
    
    res.status(201).json({
      message: "Zgłoszenie dodane pomyślnie.",
      report: result.rows[0]
    });
  } catch (error) {
    console.error("Błąd przy dodawaniu zgłoszenia:", error);
    res.status(500).json({ error: "Błąd przy dodawaniu zgłoszenia." });
  }
});

app.get("/get-my-reports", auth(["resident"]), async (req, res) => {
  try {
    const { user_id } = req.user;
    
    const result = await pool.query(
      `SELECT 
          r.*,
          u.first_name,
          u.surname,
          u.email_address,
          u.role
       FROM housing_association.report r
       JOIN housing_association."user" u 
         ON r.user_id = u.user_id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC;`,
      [user_id]
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Błąd przy pobieraniu moich zgłoszeń:", error);
    res.status(500).json({ error: "Błąd przy pobieraniu moich zgłoszeń." });
  }
});


  app.get("/get-all-reports", auth(["administrator"]), async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
            r.*,
            u.housing_association_id,
            u.first_name,
            u.surname,
            u.role,
            ha.name AS housing_association_name,
            res.resident_id,
            res.street,
            res.building_number,
            res.apartment_number,
            res.phone_number
    FROM housing_association.report r
    JOIN housing_association."user" u 
        ON r.user_id = u.user_id
    LEFT JOIN housing_association.housing_association ha 
        ON u.housing_association_id = ha.housing_association_id
    LEFT JOIN housing_association.resident res 
        ON u.user_id = res.user_id;`
      );
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Błąd przy pobieraniu zgłoszeń:", error);
      res.status(500).json({ error: "Błąd przy pobieraniu zgłoszeń." });
    }
  });

  app.get("/get-reports/:housing_association_id", auth(["administrator","resident","worker"]), async (req, res) => {
    const { housing_association_id } = req.params;
    try {
      const result = await pool.query(
        `SELECT 
            r.*,
            u.housing_association_id,
            u.first_name,
            u.surname,
            u.role,
            ha.name AS housing_association_name,
            res.resident_id,
            res.street,
            res.building_number,
            res.apartment_number,
            res.phone_number
    FROM housing_association.report r
    JOIN housing_association."user" u 
        ON r.user_id = u.user_id
    LEFT JOIN housing_association.housing_association ha 
        ON u.housing_association_id = ha.housing_association_id
    LEFT JOIN housing_association.resident res 
        ON u.user_id = res.user_id
      WHERE u.housing_association_id = $1`,
        [housing_association_id]
      );
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Błąd przy pobieraniu zgłoszeń dla spółdzielni:", error);
      res.status(500).json({ error: "Błąd przy pobieraniu zgłoszeń dla spółdzielni." });
    }
  });

    app.put("/update-report/:report_id", auth(["resident"]), async (req, res) => {
    try {
      const { report_id } = req.params;
      const { title, description } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({ error: "Brak wymaganych pól: title i description." });
      }
      
      const result = await pool.query(
        `UPDATE housing_association.report
        SET title = $1, description = $2
        WHERE report_id = $3
        RETURNING *`,
        [title, description, report_id]
      );
      
      if (result.rows.length === 0) {
        console.error("Nie znaleziono zgłoszenia dla report_id:", report_id);
        return res.status(404).json({ error: "Nie znaleziono zgłoszenia." });
      }
      
      res.status(200).json({
        message: "Zgłoszenie zaktualizowane pomyślnie.",
        report: result.rows[0]
      });
    } catch (error) {
      console.error("Błąd przy aktualizacji zgłoszenia:", error);
      res.status(500).json({ error: "Błąd przy aktualizacji zgłoszenia." });
    }
  });

   app.delete("/delete-report/:report_id", auth(["resident", "worker", "administrator"]), async (req, res) => {
    try {
      const { report_id } = req.params;
      const result = await pool.query(
        `DELETE FROM housing_association.report
         WHERE report_id = $1
         RETURNING *`,
        [report_id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Nie znaleziono zgłoszenia." });
      }
      res.status(200).json({
        message: "Zgłoszenie usunięte pomyślnie.",
        report: result.rows[0]
      });
    } catch (error) {
      console.error("Błąd przy usuwaniu zgłoszenia:", error);
      res.status(500).json({ error: "Błąd przy usuwaniu zgłoszenia." });
    }
  });
};

export default reportEndpoint;
