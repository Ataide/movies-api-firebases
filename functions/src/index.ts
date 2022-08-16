/* eslint-disable max-len */
import * as functions from "firebase-functions";
import * as express from "express";
import * as cors from "cors";
import {authMiddleware} from "./authMiddleware";


import {addMovie, findMovie, watchMovie, addMovieToWatchlist, getAllMoviesToWatch, getAllMovies, getWatchedMovies} from "./controller";


const app = express();

app.use(cors());

app.get("/", (req, res) => res.status(200).send("Api - Worc Movies."));

// Rota responsável em criar um filme na lista de filmes disponível. Sem authenticação.
app.post("/movies", addMovie );

// Rota que retorna a lista de filmess, sem authenticação.
app.get("/movies", getAllMovies );

// Rota que retorna a lista de filmes para assistir do usuario.
app.get("/movies-to-watch", authMiddleware, getAllMoviesToWatch );

// Rota que adiciona um filme a lista de filmes à assistir.
app.post("/movies-to-watch/:movieId", authMiddleware, addMovieToWatchlist );

// Rota que adiciona um filme a lista de filmes assistidos.
app.post("/watch-movie/:movieId", authMiddleware, watchMovie );

// Rota que retorna a lista de filmes assistidos.
app.get("/watched-movies/", authMiddleware, getWatchedMovies );

app.get("/find-movie/:query", findMovie );


exports.app = functions.region("southamerica-east1").https.onRequest(app);
