import pool from "../../db";
const express = require('express');
const app = express();
import auth from "../middleware/auth";
import { userManager } from '../business/user.manager';

const loginEndpoint = (app) => {
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const token = await userManager.authenticate(email, password);
      res.status(200).json({ token });
    } catch (error) {
      console.error('Błąd logowania:', error);
      res.status(401).json({ error: error.message || 'Nieprawidłowe dane logowania' });
    }
  });

  
  app.delete('/logout', auth(["administrator", "worker", "resident"]), async (req, res) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(400).json({ error: "Brak tokena w żądaniu." });
    }

    try {
      const result = await userManager.removeHashSession(token);
      res.status(202).json({ message: 'Wylogowano', result });
    } catch (error) {
      console.error('login.endpoint.js45: Błąd podczas wylogowywania:', error);
      res.status(401).json({ error: "Wylogowywanie nie powiodło się." });
    }
  });

};

export default loginEndpoint;
