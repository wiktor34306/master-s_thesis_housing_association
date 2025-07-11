import pool from "../../db";
import auth from "../middleware/auth";

const housingAssociationEndpoint = (app) => {
 app.post("/housing-association-registration", auth(["administrator"]), async (req, res) => {
  const token = req.headers['authorization']?.replace("Bearer ", "");
  const { name, address, city, postcode, phone_number, email_address } = req.body;

  try {
    const { user_id } = req.user;
    const userResult = await pool.query(
      `SELECT housing_association_id FROM housing_association."user" WHERE user_id = $1`,
      [user_id]
    );
  
    if (!userResult.rows.length) {
      return res.status(404).json({ error: "Nie znaleziono danych użytkownika." });
    }
  
    const userHA = userResult.rows[0].housing_association_id;
    
    if (userHA !== null) {
      return res.status(403).json({
        error: "Brak uprawnień do dodawania spółdzielni. Tylko główny administrator (z housing_association_id = null) może to robić."
      });
    }
  
    const existingHA = await pool.query(
      `SELECT * FROM housing_association.housing_association WHERE name = $1`,
      [name]
    );
  
    if (existingHA.rows.length > 0) {
      return res.status(400).json({
        error: "Spółdzielnia o tej nazwie już istnieje."
      });
    }
  
    const insertResult = await pool.query(
      `INSERT INTO housing_association.housing_association 
         (name, address, city, postcode, phone_number, email_address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING housing_association_id`,
      [name, address, city, postcode, phone_number, email_address]
    );
  
    console.log("Dodano nową spółdzielnię:", name);
  
    res.status(201).json({
      message: "Spółdzielnia mieszkaniowa dodana pomyślnie.",
      housing_association_id: insertResult.rows[0].housing_association_id
    });
  } catch (error) {
    console.error("Błąd przy dodawaniu spółdzielni: ", error);
    res.status(500).json({
      error: "Błąd przy dodawaniu spółdzielni."
    });
  }
});


app.get("/get-all-housing-associations", auth(["administrator"]), async (req, res) => {
  try {
    const { user_id } = req.user;
    const userResult = await pool.query(
      `SELECT housing_association_id FROM housing_association."user" WHERE user_id = $1`,
      [user_id]
    );
    
    if (!userResult.rows.length) {
      return res.status(404).json({ error: "Nie znaleziono danych użytkownika." });
    }
    
    const userHA = userResult.rows[0].housing_association_id;
    if (userHA !== null) {
      console.warn("[GET ALL HA] Użytkownik ma przypisaną spółdzielnię – brak uprawnień.");
      return res.status(403).json({ error: "Brak uprawnień do oglądania wszystkich spółdzielni." });
    }
    
    const result = await pool.query(`SELECT * FROM housing_association.housing_association`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Błąd przy pobieraniu wszystkich spółdzielni:", error);
    res.status(500).json({ error: "Błąd przy pobieraniu spółdzielni." });
  }
});


app.get("/my-housing-association", auth(["administrator","resident", "worker"]), async (req, res) => {
  try {
    const { user_id } = req.user; 
    const userResult = await pool.query(
      `SELECT housing_association_id FROM housing_association."user" WHERE user_id = $1`,
      [user_id]
    );
    if (!userResult.rows.length) {
      return res.status(404).json({ error: "Nie znaleziono danych użytkownika." });
    }
    
    const userHA = userResult.rows[0].housing_association_id;
    if (userHA === null) {
      console.warn("[MY HA] Główny administrator – brak przypisania spółdzielni.");
      return res.status(403).json({
        error: "Główny administrator ma dostęp do wszystkich spółdzielni. Użyj endpointu /get-all-housing-associations."
      });
    }
    
    const result = await pool.query(
      `SELECT * FROM housing_association.housing_association WHERE housing_association_id = $1`,
      [userHA]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Błąd przy pobieraniu spółdzielni:", error);
    res.status(500).json({ error: "Błąd przy pobieraniu spółdzielni." });
  }
});

app.get("/what-is-my-housing-association", auth(["administrator","resident","worker"]), async (req, res) => {
  try {
    const { user_id } = req.user;
    
    const userQuery = await pool.query(
      `SELECT housing_association_id 
       FROM housing_association."user" 
       WHERE user_id = $1`,
      [user_id]
    );
    
    if (!userQuery.rows.length) {
      return res.status(404).json({ error: "Nie znaleziono danych użytkownika." });
    }
    
    const housingAssociationId = userQuery.rows[0].housing_association_id;
    
    if (housingAssociationId === null) {
      return res.status(200).json({ 
        housing_association: null, 
        message: "Użytkownik nie ma przypisanej spółdzielni." 
      });
    }
    
    const haQuery = await pool.query(
      `SELECT * 
       FROM housing_association.housing_association 
       WHERE housing_association_id = $1`,
      [housingAssociationId]
    );
    
    if (!haQuery.rows.length) {
      return res.status(404).json({ error: "Nie znaleziono spółdzielni." });
    }
    
    res.status(200).json({ housing_association: haQuery.rows[0] });
  } catch (error) {
    console.error("Błąd przy pobieraniu spółdzielni:", error);
    res.status(500).json({ error: "Błąd przy pobieraniu spółdzielni." });
  }
});



app.put("/edit-my-housing-association", auth(["administrator"]), async (req, res) => {
  try {
    const userId = req.user.user_id;
    const userResult = await pool.query(
      `SELECT housing_association_id FROM housing_association."user" WHERE user_id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono danych użytkownika." });
    }

    let userHAId = userResult.rows[0].housing_association_id;

    const { housing_association_id, name, address, city, postcode, phone_number, email_address } = req.body;

    const haIdToUpdate = userHAId || housing_association_id;
    if (!haIdToUpdate) {
      return res.status(400).json({ error: "Nie podano identyfikatora spółdzielni do edycji." });
    }

    const updateResult = await pool.query(
      `UPDATE housing_association.housing_association
         SET name = COALESCE($1, name),
             address = COALESCE($2, address),
             city = COALESCE($3, city),
             postcode = COALESCE($4, postcode),
             phone_number = COALESCE($5, phone_number),
             email_address = COALESCE($6, email_address)
       WHERE housing_association_id = $7
       RETURNING housing_association_id, name, address, city, postcode, phone_number, email_address`,
      [name, address, city, postcode, phone_number, email_address, haIdToUpdate]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: "Nie udało się zaktualizować spółdzielni." });
    }

    res.status(200).json({
      message: "Dane spółdzielni zostały zaktualizowane.",
      housingAssociation: updateResult.rows[0]
    });
  } catch (error) {
    console.error("Błąd przy aktualizacji danych spółdzielni:", error);
    res.status(500).json({ error: "Błąd przy aktualizacji danych spółdzielni." });
  }
});

app.delete("/delete-housing-association/:id", auth(["administrator"]), async (req, res) => {
  try {
    const housingAssociationId = req.params.id;

    const deleteResult = await pool.query(
      `DELETE FROM housing_association.housing_association
       WHERE housing_association_id = $1
       RETURNING housing_association_id, name, address, city, postcode, phone_number, email_address`,
      [housingAssociationId]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono spółdzielni do usunięcia." });
    }

    res.status(200).json({
      message: "Spółdzielnia została usunięta pomyślnie.",
      housingAssociation: deleteResult.rows[0]
    });
  } catch (error) {
    console.error("Błąd przy usuwaniu spółdzielni:", error);
    res.status(500).json({ error: "Błąd przy usuwaniu spółdzielni." });
  }
});

};

export default housingAssociationEndpoint;
