'use strict';
const dotenv = require('dotenv');
dotenv.config();
const { Pool } = require('pg');
const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const bodyParser = require('body-parser');


app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const DB_HOST = process.env.DATABASE_HOST || 'dpg-cg3423l269v3bp87jh5g-a';

const pool = new Pool({
  user: 'queries_225t_user',
  host: DB_HOST,
  database: 'queries_225t',
  password: 'fAXGDT7MNFG56GeeSEIRVBpKLz3Vnd6z',
  port: 5432,
});

app.get('/api/queries', (req, res, next) => {
  pool.query('SELECT * FROM queries', (err, result) => {
    if (err) {
      return next(err);
    }
    const rows = result.rows;
    console.log(rows);
    return res.send(rows);
  });
});

app.get('/api/queries/:id', (req, res, next) => {
  const id = Number.parseInt(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(404).send("No query found with that ID");
  }
  console.log("query ID: ", id);
  pool.query('SELECT * FROM queries WHERE id = $1', [id], (err, result) => {
    if (err) {
      return next(err);
    }
    const query = result.rows[0];
    console.log("Single query ID", id, "values:", query);
    if (query) {
      return res.send(query);
    } else {
      return res.status(404).send("No query found with that ID");
    }
  });
});

app.post('/api/queries', (req, res, next) => {
  const { query } = req.body;
  console.log(req);
  console.log("Request body", query);
  if (query) {
    pool.query('INSERT INTO queries (query) VALUES ($1) RETURNING *', [query], (err, data) => {
      const newQuery = data.rows[0];
      console.log("Created newQuery: ", newQuery);
      if (newQuery) {
        return res.send(newQuery);
      } else {
        return next(err);
      }
    });
  } else {
    return res.status(400).send("Unable to create query from request body");
  }
});

app.patch('/api/queries/:id', (req, res, next) => { // currently not in use, reeee.
  const id = Number.parseInt(req.params.id);
  const { name } = req.body;
  if (!Number.isInteger(id)) {
    res.status(400).send("No query found with that ID");
  }
  console.log("QueryID: ", id);
  pool.query('SELECT * FROM queries WHERE id = $1', [id], (err, result) => {
    if (err) {
      return next(err);
    }
    console.log("request body name: ", name);
    const query = result.rows[0];
    console.log("Single query ID from DB", id, "values:", query);
    if (!query) {
      return res.status(404).send("No query found with that ID");
    } else {
      const updatedName = name || query.name;
      pool.query('UPDATE queries SET name=$1 WHERE id = $2 RETURNING *',
        [updatedName, id], (err, data) => {

          if (err) {
            return next(err);
          }
          const updatedQuery = data.rows[0];
          console.log("updated row:", updatedQuery);
          return res.send(updatedQuery);
        });
    }
  });
});

app.delete("/api/queries/:id", (req, res, next) => {
  const id = Number.parseInt(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).send("No query found with that ID");
  }
  pool.query('DELETE FROM queries WHERE id = $1 RETURNING *', [id], (err, data) => {
    if (err) {
      return next(err);
    }
    const deletedQuery = data.rows[0];
    console.log(deletedQuery);
    if (deletedQuery) {
      res.send(deletedQuery);
    } else {
      res.status(404).send("No query found with that ID");
    }
  });
});

app.get('/api/boom', (_req, _res, next) => {
  next(new Error('BOOM!'));
});
app.get('/api/test', (req, res) => {
  res.send("Hello World!");
});
app.use((_req, res) => {
  res.sendStatus(404);
});
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.sendStatus(500);
});
app.listen(port, () => {
  console.log('Listening on port', port);
});

module.exports = app;