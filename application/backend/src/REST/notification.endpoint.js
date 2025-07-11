import pool from "../../db";
import auth from "../middleware/auth";

const notificationEndpoint = (app) => {
app.put("/update-report-status/:reportId", auth(["administrator","worker"]), async (req, res) => {
  const { reportId } = req.params;
  const { status, is_it_done } = req.body;
  try {
    const result = await pool.query(
      `UPDATE housing_association.report 
        SET status = $1, is_it_done = $2 
        WHERE report_id = $3 
        RETURNING *`,
      [status, is_it_done, reportId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: "Zgłoszenie nie znalezione" });
    }
    
    const report = result.rows[0];

    const userResult = await pool.query(
      `SELECT user_id, first_name FROM housing_association."user" WHERE user_id = $1`,
      [report.user_id]
    );
    const user = userResult.rows[0];

    let statusMap = {
      "do wykonania": "do zrobienia",
      "wykonane": "zrobione"
    };
    const message = `Zmieniono status Twojego zgłoszenia "${report.title}" na ${statusMap[status] || status}.`;

    await pool.query(
      `INSERT INTO housing_association.notification (user_id, report_id, message) 
       VALUES ($1, $2, $3)`,
      [user.user_id, report.report_id, message]
    );

    res.status(200).json({ message: "Status zmieniony pomyślnie." });
  } catch (error) {
    console.error("Błąd przy aktualizacji statusu zgłoszenia:", error);
    res.status(500).json({ error: "Błąd przy aktualizacji statusu zgłoszenia." });
  }
});

app.put("/mark-notification-read/:notificationId", auth(["resident"]), async (req, res) => {
  const { notificationId } = req.params;
  try {
    await pool.query(
      `UPDATE housing_association.notification 
       SET is_read = TRUE 
       WHERE notification_id = $1`,
      [notificationId]
    );
    res.status(200).json({ message: "Powiadomienie oznaczone jako odczytane." });
  } catch (error) {
    console.error("Błąd przy oznaczaniu powiadomienia jako odczytane:", error);
    res.status(500).json({ error: "Błąd przy oznaczaniu powiadomienia jako odczytane." });
  }
});


app.get("/get-notifications/:userId", auth(["resident"]), async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM housing_association.notification 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Błąd przy pobieraniu powiadomień:", error);
    res.status(500).json({ error: "Błąd przy pobieraniu powiadomień." });
  }
});
};

export default notificationEndpoint;
