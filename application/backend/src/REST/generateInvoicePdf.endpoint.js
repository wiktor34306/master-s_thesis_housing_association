const express = require('express');
const app = express();
const pdf = require('html-pdf');
const path = require('path');
const invoiceTemplate = require('../documents/invoiceTemplate');
const fs = require('fs');
import pool from "../../db";
import auth from "../middleware/auth";
import moment from 'moment-timezone';

const generateInvoicePdfEndpoint = (app) => {
  app.post('/create-invoice', auth(['administrator', 'worker']), async (req, res) => {
    const now = moment().tz("Europe/Warsaw");
    const currentDate = now.format('YYYYMMDD');
    const currentTime = now.format('HHmmss');

    const userId = req.body.data.user_id;
    const fileName = `faktura_${currentDate}_${currentTime}_${userId}.pdf`;

    const relativeFilePath = `../generated_invoice_pdf_file/${fileName}`;

    const query = 'INSERT INTO housing_association.document (name, path, date_of_creation, user_id, document_type, is_paid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING document_id';
    const values = [fileName, relativeFilePath, now.toDate(), userId, 'faktura', false];

    try {
      const result = await pool.query(query, values);
      const documentId = result.rows[0].document_id;

      const html = invoiceTemplate(req.body.data);
      
      const outputPath = path.join(__dirname, relativeFilePath);
      
      pdf.create(html, {}).toFile(outputPath, (err, resultFile) => {
        if (err) {
          console.error("Błąd generowania pliku PDF:", err);
          return res.status(500).send({ error: 'Błąd generowania pliku PDF' });
        }
        res.send({ documentId: documentId, fileName: fileName });
      });
    } catch (error) {
      console.error("Błąd zapisu informacji o pliku PDF do bazy danych:", error);
      res.status(500).send({ error: 'Błąd zapisu informacji o pliku PDF do bazy danych' });
    }
  });

    app.get('/get-invoices-by-user-id', auth(['resident']), async (req, res) => {
      const user_id = req.user.user_id;
      const query = `
          SELECT d.document_id, d.name, d.path, d.date_of_creation, u.first_name, u.surname
          FROM housing_association.document d
          JOIN housing_association."user" u ON d.user_id = u.user_id
          WHERE d.user_id = $1
        `;
      const values = [user_id];

      try {
        const result = await pool.query(query, values);
        res.status(200).json(result.rows);
      } catch (error) {
        console.error("Błąd pobierania faktur z bazy danych:", error);
        res.status(500).json({ error: "Błąd pobierania faktur z bazy danych" });
      }
    });


    app.get('/get-invoices-by-housing-association', auth(['administrator', 'worker']), async (req, res) => {
    try {
      const { user_id } = req.user;
      const queryUser = `
        SELECT housing_association_id 
        FROM housing_association.user 
        WHERE user_id = $1
      `;
      const userResult = await pool.query(queryUser, [user_id]);
      if (!userResult.rows.length) {
        return res.status(404).json({ error: "Nie znaleziono informacji dla użytkownika" });
      }
      const housing_association_id = userResult.rows[0].housing_association_id;

      const queryDocs = `
        SELECT d.document_id, d.name, d.path, d.date_of_creation, u.first_name, u.surname
        FROM housing_association.document d
        JOIN housing_association.user u ON d.user_id = u.user_id
        WHERE u.housing_association_id = $1
      `;
      const values = [housing_association_id];

      const docsResult = await pool.query(queryDocs, values);
      res.status(200).json(docsResult.rows);
    } catch (error) {
      console.error("Błąd pobierania dokumentów z bazy danych:", error);
      res.status(500).json({ error: "Błąd pobierania dokumentów z bazy danych" });
    }
  });

  
app.get('/fetch-pdf', auth(['administrator', 'worker', 'resident']), async (req, res) => {

  const query = 'SELECT name FROM housing_association.document WHERE document_id = $1';
  const values = [req.query.documentId];

  try {
    const result = await pool.query(query, values);    
    if (!result.rows.length) {
      console.error("backend [ERROR] Nie znaleziono dokumentu dla documentId:", req.query.documentId);
      return res.status(404).json({ error: "Nie znaleziono dokumentu" });
    }
    
    const fileName = result.rows[0].name;

    const filePath = path.join(__dirname, `../generated_invoice_pdf_file/${fileName}`);
    
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("backend [ERROR] Błąd wysyłania pliku:", err);
        return res.status(500).json({ error: "Błąd wysyłania pliku PDF" });
      }
    });
  } catch (error) {
    console.error('backend [ERROR] Błąd pobierania nazwy pliku PDF z bazy danych:', error);
    res.status(500).send({ error: 'Błąd pobierania nazwy pliku PDF z bazy danych' });
  }
});



app.delete('/delete-invoice/:id', auth(['administrator', 'worker']), async (req, res) => {
  const documentId = req.params.id;

  const query = 'SELECT * FROM housing_association.document WHERE document_id = $1';
  const values = [documentId];

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      console.error("backend [ERROR] Nie znaleziono dokumentu dla documentId:", documentId);
      return res.status(404).json({ error: "Nie znaleziono dokumentu" });
    }
    
    const document = result.rows[0];

    const filePath = path.join(__dirname, document.path);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("backend [ERROR] Błąd usuwania pliku PDF:", err);
        return res.status(500).json({ error: "Błąd usuwania pliku PDF" });
      }

      const deleteQuery = 'DELETE FROM housing_association.document WHERE document_id = $1';
      pool.query(deleteQuery, values, (error, deleteResult) => {
        if (error) {
          console.error("backend [ERROR] Błąd usuwania informacji o pliku PDF z bazy danych:", error);
          return res.status(500).json({ error: "Błąd usuwania informacji o pliku PDF z bazy danych" });
        }

        res.json({ message: "Dokument został pomyślnie usunięty." });
      });
    });
  } catch (error) {
    console.error("backend [ERROR] Błąd pobierania informacji o pliku PDF z bazy danych:", error);
    res.status(500).json({ error: "Błąd pobierania informacji o pliku PDF z bazy danych" });
  }
});


};

export default generateInvoicePdfEndpoint;
