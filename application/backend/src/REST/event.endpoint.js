import pool from "../../db";
import auth from "../middleware/auth";

const eventEndpoint = (app) => {
  app.post("/add-event", auth(["administrator","worker"]), async (req, res) => {
    const { title, description, event_date, housing_association_id } = req.body;
    try {
      const insertResult = await pool.query(
        `INSERT INTO housing_association.event (title, description, event_date, created_by, housing_association_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING event_id`,
        [title, description, event_date, req.user.user_id, housing_association_id]
      );
      res.status(201).json({
        message: "Wydarzenie dodane pomyślnie.",
        event_id: insertResult.rows[0].event_id
      });
    } catch (error) {
      console.error("Błąd przy dodawaniu wydarzenia:", error);
      res.status(500).json({ error: "Błąd przy dodawaniu wydarzenia." });
    }
  });

  app.get("/get-all-events", auth(["administrator"]), async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
          e.*, 
          ha.name AS housing_association_name, 
          ha.address, 
          ha.city, 
          ha.postcode, 
          ha.phone_number, 
          ha.email_address
        FROM housing_association.event e
        JOIN housing_association.housing_association ha
          ON e.housing_association_id = ha.housing_association_id`
      );
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Błąd przy pobieraniu wydarzeń:", error);
      res.status(500).json({ error: "Błąd przy pobieraniu wydarzeń." });
    }
  });


  app.get("/get-events/:housing_association_id", auth(["administrator","worker","resident"]), async (req, res) => {
  const housingAssociationId = req.params.housing_association_id;
  
  try {
    const result = await pool.query(
      `SELECT 
         e.*, 
         ha.name AS housing_association_name, 
         ha.address, 
         ha.city, 
         ha.postcode, 
         ha.phone_number, 
         ha.email_address
       FROM housing_association.event e
       JOIN housing_association.housing_association ha 
         ON e.housing_association_id = ha.housing_association_id
       WHERE e.housing_association_id = $1`,
      [housingAssociationId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Błąd przy pobieraniu wydarzeń dla spółdzielni:", error);
    res.status(500).json({ error: "Błąd przy pobieraniu wydarzeń." });
  }
});
  

  app.put("/event/:event_id", auth(["administrator","worker","resident"]), async (req, res) => {
    const event_id = req.params.event_id;
    const { title, description, event_date, housing_association_id } = req.body;
    try {
      const updateResult = await pool.query(
        `UPDATE housing_association.event
         SET title = $1, description = $2, event_date = $3, housing_association_id = $4
         WHERE event_id = $5
         RETURNING *`,
        [title, description, event_date, housing_association_id, event_id]
      );
      if (updateResult.rows.length === 0) {
        return res.status(404).json({ error: "Wydarzenie nie znalezione." });
      }
      res.status(200).json({
        message: "Wydarzenie zaktualizowane pomyślnie.",
        event: updateResult.rows[0]
      });
    } catch (error) {
      console.error("Błąd przy aktualizacji wydarzenia:", error);
      res.status(500).json({ error: "Błąd przy aktualizacji wydarzenia." });
    }
  });

  app.delete("/event/:event_id", auth(["administrator","worker","resident"]), async (req, res) => {
    const event_id = req.params.event_id;
    try {
      const deleteResult = await pool.query(
        `DELETE FROM housing_association.event
         WHERE event_id = $1`,
        [event_id]
      );
      if (deleteResult.rowCount === 0) {
        return res.status(404).json({ error: "Wydarzenie nie znalezione." });
      }
      res.status(200).json({ message: "Wydarzenie usunięte pomyślnie." });
    } catch (error) {
      console.error("Błąd przy usuwaniu wydarzenia:", error);
      res.status(500).json({ error: "Błąd przy usuwaniu wydarzenia." });
    }
  });
};

export default eventEndpoint;
