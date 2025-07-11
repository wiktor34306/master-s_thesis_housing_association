import pool from "../../db";
import auth from "../middleware/auth";

const advertisementEndpoint = (app) => {
app.post("/create-advertisement", auth(["administrator", "worker", "resident"]), async (req, res) => {
  const { title, content, housing_association_id: housingAssociationFromBody } = req.body;
  const { user_id } = req.user;

  try {
    const userQuery = await pool.query(
      `SELECT housing_association_id 
       FROM housing_association."user" 
       WHERE user_id = $1`,
      [user_id]
    );

    if (!userQuery.rows.length) {
      return res.status(404).json({ error: "Nie znaleziono danych użytkownika." });
    }

    const userHAId = userQuery.rows[0].housing_association_id;
    let finalHousingAssociationId = null;

    if (userHAId !== null) {
      finalHousingAssociationId = userHAId;
    } else {

      if (!housingAssociationFromBody) {
        return res.status(400).json({
          error: "Nie wybrano spółdzielni. Wybierz spółdzielnię, do której ma być dodane ogłoszenie."
        });
      }
      finalHousingAssociationId = housingAssociationFromBody;
    }

    const insertResult = await pool.query(
      `INSERT INTO housing_association.advertisement (user_id, title, content, housing_association_id)
       VALUES ($1, $2, $3, $4)
       RETURNING advertisement_id`,
      [user_id, title, content, finalHousingAssociationId]
    );

    res.status(201).json({
      message: "Ogłoszenie dodane pomyślnie.",
      advertisement_id: insertResult.rows[0].advertisement_id
    });
  } catch (error) {
    console.error("Błąd przy dodawaniu ogłoszenia:", error);
    res.status(500).json({ error: "Błąd przy dodawaniu ogłoszenia." });
  }
});


app.get("/get-all-advertisements", auth(["administrator"]), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         a.advertisement_id, 
         a.user_id, 
         a.date_of_creation, 
         a.title, 
         a.content,
         u.first_name, 
         u.surname, 
         u.role,
         ha.name AS cooperative_name,
         ha.city AS cooperative_city,
         CASE 
           WHEN ha.name IS NOT NULL THEN 'Dla: ' || ha.name || ' - ' || ha.city 
           ELSE 'Brak spółdzielni'
         END AS dla_cooperative
       FROM housing_association.advertisement a
       INNER JOIN housing_association."user" u ON a.user_id = u.user_id
       LEFT JOIN housing_association.housing_association ha ON a.housing_association_id = ha.housing_association_id;`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Błąd przy pobieraniu ogłoszeń:", error);
    res.status(500).json({ error: "Błąd przy pobieraniu ogłoszeń." });
  }
});



  app.put("/advertisement/:advertisement_id", auth(["administrator","worker","resident"]), async (req, res) => {
    const advertisement_id = req.params.advertisement_id;
    const { title, content } = req.body;
    try {
      const updateResult = await pool.query(
        `UPDATE housing_association.advertisement
         SET title = $1, content = $2
         WHERE advertisement_id = $3
         RETURNING *`,
         [title, content, advertisement_id]
      );
      if (updateResult.rows.length === 0) {
        return res.status(404).json({ error: "Ogłoszenie nie znalezione." });
      }
      res.status(200).json({
        message: "Ogłoszenie zaktualizowane pomyślnie.",
        advertisement: updateResult.rows[0]
      });
    } catch (error) {
      console.error("Błąd przy aktualizacji ogłoszenia:", error);
      res.status(500).json({ error: "Błąd przy aktualizacji ogłoszenia." });
    }
  });

  app.delete("/advertisement/:advertisement_id", auth(["administrator","worker","resident"]), async (req, res) => {
    const advertisement_id = req.params.advertisement_id;
    try {
      const deleteResult = await pool.query(
        `DELETE FROM housing_association.advertisement
         WHERE advertisement_id = $1`,
         [advertisement_id]
      );
      if (deleteResult.rowCount === 0) {
        return res.status(404).json({ error: "Ogłoszenie nie znalezione." });
      }
      res.status(200).json({ message: "Ogłoszenie usunięte pomyślnie." });
    } catch (error) {
      console.error("Błąd przy usuwaniu ogłoszenia:", error);
      res.status(500).json({ error: "Błąd przy usuwaniu ogłoszenia." });
    }
  });

app.get("/advertisement-for-association", auth(["administrator", "worker", "resident"]), async (req, res) => {
  const userId = req.user.user_id;

  try {
    const userQuery = `
      SELECT housing_association_id 
      FROM housing_association."user" 
      WHERE user_id = $1
    `;
    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono użytkownika." });
    }

    const housingAssociationId = userResult.rows[0].housing_association_id;

    const adsQuery = `
      SELECT 
        a.advertisement_id, 
        a.user_id, 
        a.date_of_creation, 
        a.title, 
        a.content,
        u.first_name, 
        u.surname, 
        u.role,
        ha.name AS cooperative_name,
        ha.city AS cooperative_city
      FROM housing_association.advertisement a
      JOIN housing_association."user" u ON a.user_id = u.user_id
      LEFT JOIN housing_association.housing_association ha ON u.housing_association_id = ha.housing_association_id
      WHERE (u.housing_association_id = $1 OR u.housing_association_id IS NULL)

    `;
    const adsResult = await pool.query(adsQuery, [housingAssociationId]);

    res.status(200).json(adsResult.rows);
  } catch (error) {
    console.error("Błąd przy pobieraniu ogłoszeń dla spółdzielni:", error);
    res.status(500).json({ error: "Błąd przy pobieraniu ogłoszeń dla spółdzielni." });
  }
});


    app.get("/advertisement-which-I-added", auth(["administrator", "worker", "resident"]), async (req, res) => {
      const userId = req.user.user_id;
      try {
        const result = await pool.query(
          `SELECT 
            a.advertisement_id, 
            a.user_id, 
            a.date_of_creation, 
            a.title, 
            a.content,
            u.first_name, 
            u.surname, 
            u.role
          FROM housing_association.advertisement a
          INNER JOIN housing_association."user" u ON a.user_id = u.user_id
          WHERE a.user_id = $1`,
          [userId]
        );
        res.status(200).json(result.rows);
      } catch (error) {
        console.error("Błąd przy pobieraniu moich ogłoszeń:", error);
        res.status(500).json({ error: "Błąd przy pobieraniu ogłoszeń." });
      }
    });


};

export default advertisementEndpoint;
