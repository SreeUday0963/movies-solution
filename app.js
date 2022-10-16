const express = require("express");
const app = express();

const path = require("path");
const databasePath = path.join(__dirname, "moviesData.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app.use(express.json());

let db = null;

const initialieDBAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost/3000/");
    });
  } catch (error) {
    console.log(`DB Error ${error.message}`);
    process.exit(1);
  }
};
initialieDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

// Retrives all moive names
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
        movie_name AS movieName
    FROM
        movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray);
});

// Adding a movie to database
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
      INSERT INTO
      movie ( director_id, movie_name, lead_actor)
      VALUES
         (${directorId}, '${movieName}', '${leadActor}');`;
  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

// get a movie

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
        *
    FROM
        movie
    WHERE
        movie_id = '${movieId}';`;
  const movieResult = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movieResult));
});

//update details
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE
        movie
    SET
        director_id = '${directorId}',
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE
        movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// delete a movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE 
    FROM 
        movie
    WHERE 
        movie_id = ${movieId}
    ;`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

// get all directors

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT 
       director_id AS directorId,
       director_name AS directorName
    FROM
        director
    ;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(directorsArray);
});

// get a distinct movies
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT 
        movie_name AS movieName
    FROM
        movie
    WHERE
        director_id = '${directorId}';`;
  const MoviesArray = await db.all(getDirectorMoviesQuery);
  response.send(MoviesArray);
});
module.exports = app;
