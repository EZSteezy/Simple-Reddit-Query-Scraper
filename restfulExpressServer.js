'use strict';
const dotenv = require('dotenv');
dotenv.config();
const { Pool } = require('pg');
const express = require('express');
const app = express();
const port = process.env.PORT || 8000; // port that Express will listen to for requests

const bodyParser = require('body-parser');
app.use(bodyParser.json());


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
const DB_HOST = process.env.DATABASE_HOST || 'dpg-cg14da5269vfsnr41oi0-a';

const pool = new Pool({
  user: 'stevesmoviesdb_user',
  host: DB_HOST,
  database: 'stevesmoviesdb',
  password: 'uozZg5baXPLH2JTdVejgTCUUKDFX8fID',
  port: 5432,
});
dpg
// GET request to /movies - Read all the movies
app.get('/api/movies', (req, res, next) => {
  // Get all the rows in movies table
  pool.query('SELECT * FROM movies', (err, result) => {
    if (err){
      return next(err);
    }
    
    const rows = result.rows;
    console.log(rows);
    return res.send(rows);
  });
});

// GET request to /movies/:id - Read one movie
app.get('/api/movies/:id', (req, res, next) => {
  // Get a single movie from the table
  const id = Number.parseInt(req.params.id);
  if (!Number.isInteger(id)){
    res.status(404).send("No movie found with that ID");
  }
  console.log("movie ID: ", id);
  
  pool.query('SELECT * FROM movies WHERE id = $1', [id], (err, result) => {
    if (err){
      return next(err);
    }
    
    const movie = result.rows[0];
    console.log("Single movie ID", id, "values:", movie);
    if (movie){
      return res.send(movie);
    } else {
      return res.status(404).send("No movie found with that ID");
    }
  });
});

// POST to /movies - Create a movie
app.post('/api/movies', (req, res, next) => {
  const score = Number.parseInt(req.body.score);
  const {name, genre} = req.body;
  console.log("Request body name, genre, score", name, genre, score);
  // check request data - if everything exists and score is a number
  if (name && genre && score && !Number.isNaN(score)){
    pool.query('INSERT INTO movies (name, genre, score) VALUES ($1, $2, $3) RETURNING *', [name, genre, score], (err, data) => {
      const movie = data.rows[0];
      console.log("Created Movie: ", movie);
      if (movie){
        return res.send(movie);
      } else {
        return next(err);
      }
    });

  } else {
    return res.status(400).send("Unable to create movie from request body");
  }

});


// PATCH to /movies/:id - Update a movie
app.patch('/api/movies/:id', (req, res, next) => {
  // parse id from URL
  const id = Number.parseInt(req.params.id);
  // get data from request body
  const score = Number.parseInt(req.body.score);
  const {name, genre} = req.body;
  // if id input is ok, make DB call to get existing values
  if (!Number.isInteger(id)){
    res.status(400).send("No movie found with that ID");
  }
  console.log("MovieID: ", id);
  // get current values of the movie with that id from DB
  pool.query('SELECT * FROM movies WHERE id = $1', [id], (err, result) => {
    if (err){
      return next(err);
    }
    console.log("request body name, score, genre: ", name, score, genre);
    const movie = result.rows[0];
    console.log("Single Movie ID from DB", id, "values:", movie);
    if (!movie){
      return res.status(404).send("No movie found with that ID");
    } else {
      // check which values are in the request body, otherwise use the previous movie values
      // let updatedName = null; 
      const updatedName = name || movie.name; 
      // if (name){
      //   updatedName = name;
      // } else {
      //   updatedName = movies.name;
      // }
      const updatedGenre = genre || movie.genre;
      const updatedScore = score || movie.score;

      pool.query('UPDATE movies SET name=$1, genre=$2, score=$3 WHERE id = $4 RETURNING *', 
          [updatedName, updatedGenre, updatedScore, id], (err, data) => {
        
        if (err){
          return next(err);
        }
        const updatedMovie = data.rows[0];
        console.log("updated row:", updatedMovie);
        return res.send(updatedMovie);
      });
    }    
  });
});


// DELETE to /movies/:id - Delete a movie
app.delete("/api/movies/:id", (req, res, next) => {
  const id = Number.parseInt(req.params.id);
  if (!Number.isInteger(id)){
    return res.status(400).send("No movie found with that ID");
  }

  pool.query('DELETE FROM movies WHERE id = $1 RETURNING *', [id], (err, data) => {
    if (err){
      return next(err);
    }
    
    const deletedMovie = data.rows[0];
    console.log(deletedMovie);
    if (deletedMovie){
      // respond with deleted row
      res.send(deletedMovie);
    } else {
      res.status(404).send("No movie found with that ID");
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