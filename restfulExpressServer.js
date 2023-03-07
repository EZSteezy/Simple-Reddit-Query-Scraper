'use strict';
const dotenv = require('dotenv');
dotenv.config();
const { Pool } = require('pg');
const express = require('express');
const app = express();
const port = process.env.PORT || 8000; // port that Express will listen to for requests

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// use DATABASE_HOST environmental variable if it exists (set by docker compose),
// or default to localhost if no value is set (run outside docker) 

/*const DB_HOST = process.env.DATABASE_HOST || 'localhost';

const pool = new Pool({
  user: 'postgres',
  host: DB_HOST,
  database: 'movies',
  password: 'password',
  port: 5432,
});
*/
const DB_HOST = process.env.DATABASE_HOST || 'dpg-cg3423l269v3bp87jh5g-a';

const pool = new Pool({
  user: 'queries_225t_user',
  host: DB_HOST,
  database: 'queries_225t',
  password: 'fAXGDT7MNFG56GeeSEIRVBpKLz3Vnd6z',
  port: 5432,
});

// GET request to /movies - Read all the movies
app.get('/api/queries', (req, res, next) => {
  // Get all the rows in movies table
  pool.query('SELECT * FROM queries', (err, result) => {
    if (err){
      return next(err);
    }
    
    const rows = result.rows;
    console.log(rows);
    return res.send(rows);
  });
});

// GET request to /movies/:id - Read one movie
app.get('/api/queries/:id', (req, res, next) => {
  // Get a single movie from the table
  const id = Number.parseInt(req.params.id);
  if (!Number.isInteger(id)){
    res.status(404).send("No query found with that ID");
  }
  console.log("query ID: ", id);
  
  pool.query('SELECT * FROM queries WHERE id = $1', [id], (err, result) => {
    if (err){
      return next(err);
    }
    
    const query = result.rows[0];
    console.log("Single query ID", id, "values:", query);
    if (query){
      return res.send(query);
    } else {
      return res.status(404).send("No query found with that ID");
    }
  });
});

// POST to /movies - Create a movie
app.post('/api/queries', (req, res, next) => {
  const {query} = req.body;
  console.log("Request body", query);
  // check request data - if everything exists
  if (query){
    pool.query('INSERT INTO queries (query) VALUES ($1) RETURNING *', [query], (err, data) => {
      const newQuery = data.rows[0];
      console.log("Created newQuery: ", newQuery);
      if (newQuery){
        return res.send(newQuery);
      } else {
        return next(err);
      }
    });

  } else {
    return res.status(400).send("Unable to create query from request body");
  }

});


// PATCH to /movies/:id - Update a movie
app.patch('/api/queries/:id', (req, res, next) => {
  // parse id from URL
  const id = Number.parseInt(req.params.id);
  // get data from request body
  const {name} = req.body;
  // if id input is ok, make DB call to get existing values
  if (!Number.isInteger(id)){
    res.status(400).send("No query found with that ID");
  }
  console.log("QueryID: ", id);
  // get current values of the movie with that id from DB
  pool.query('SELECT * FROM queries WHERE id = $1', [id], (err, result) => {
    if (err){
      return next(err);
    }
    console.log("request body name: ", name);
    const query = result.rows[0];
    console.log("Single query ID from DB", id, "values:", query);
    if (!query){
      return res.status(404).send("No query found with that ID");
    } else {
      // check which values are in the request body, otherwise use the previous movie values
      // let updatedName = null; 
      const updatedName = name || query.name; 
      // if (name){
      //   updatedName = name;
      // } else {
      //   updatedName = movies.name;
      // }

      pool.query('UPDATE queries SET name=$1 WHERE id = $2 RETURNING *', 
          [updatedName, id], (err, data) => {
        
        if (err){
          return next(err);
        }
        const updatedQuery = data.rows[0];
        console.log("updated row:", updatedQuery);
        return res.send(updatedQuery);
      });
    }    
  });
});


// DELETE to /movies/:id - Delete a movie
app.delete("/api/queries/:id", (req, res, next) => {
  const id = Number.parseInt(req.params.id);
  if (!Number.isInteger(id)){
    return res.status(400).send("No query found with that ID");
  }

  pool.query('DELETE FROM queries WHERE id = $1 RETURNING *', [id], (err, data) => {
    if (err){
      return next(err);
    }
    
    const deletedQuery = data.rows[0];
    console.log(deletedQuery);
    if (deletedQuery){
      // respond with deleted row
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

// eslint-disable-next-line max-params
app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err.stack);
  res.sendStatus(500);
});


app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('Listening on port', port);
});

module.exports = app;