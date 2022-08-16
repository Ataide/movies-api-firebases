/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {Response} from "express";
import {db} from "./config/firebase";
import {DocumentSnapshot} from "firebase-functions/v1/firestore";

type Request = {
  body: MovieType;
  params: { movieId: string; userId: string; query: string };
};

type MovieType = {
  id?: string;
  name: string;
  genre: string;
  director: string;
  rating: number;
  cover_url: string;
  year: string;
  actors: string;
  sinopsis: string;
};

const findMovie = async (req: Request, res: Response) => {
  try {
    const {query} = req.params;
    const allMovies: MovieType[] = [];
    const endText = query.toLowerCase();
    const querySnapshot = await db.collection("movies").get();
    querySnapshot.forEach((doc: DocumentSnapshot) => {
      allMovies.push(doc.data() as MovieType);
    });
    const data = allMovies.filter((m) =>
      m.name.toLowerCase().includes(endText)
    );
    return res.status(200).json(data);
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).json(error.message);
  }
};

const watchMovie = async (req: Request, res: Response) => {
  const {movieId} = req.params;

  try {
    const entry = db.collection("movies-to-watch").doc(movieId);

    const entryObject = {
      watched: true,
      updated_at: new Date(),
    };

    await entry.update(entryObject).catch((error) => {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    });

    return res.status(200).json({
      status: "success",
      message: "entry updated successfully",
      data: entryObject,
    });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

const getWatchedMovies = async (req: Request, res: Response) => {
  try {
    const {userId} = req.params;
    const allMovies: MovieType[] = [];
    const querySnapshot = await db
        .collection("movies-to-watch")
        .where("userId", "==", userId)
        .where("watched", "==", true)
        .get();
    querySnapshot.forEach((doc: any) => allMovies.push(doc.data()));
    return res.status(200).json(allMovies);
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).json(error.message);
  }
};

const getAllMoviesToWatch = async (req: Request, res: Response) => {
  try {
    const {userId} = req.params;
    const allMovies: MovieType[] = [];
    const querySnapshot = await db
        .collection("movies-to-watch")
        .where("userId", "==", userId)
        .where("watched", "==", false)
        .get();
    querySnapshot.forEach((doc: any) => allMovies.push(doc.data()));
    return res.status(200).json(allMovies);
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).json(error.message);
  }
};

const addMovieToWatchlist = async (req: Request, res: Response) => {
  try {
    const {movieId, userId} = req.params;
    const entry = db.collection("movies-to-watch").doc();
    const movieExists = await db
        .collection("movies-to-watch")
        .where("userId", "==", userId)
        .where("movie.id", "==", movieId)
        .get();

    if (!movieExists.empty) {
      return res
          .status(400)
          .json({
            message: "Seu filme já existe na lista de filmes para assistir.",
          });
    }

    const movieData = db.collection("movies").doc(movieId);
    const currentMovie = (await movieData.get()).data() || {};

    if (currentMovie.id) {
      const entryObject = {
        uid: entry.id,
        userId: userId,
        watched: false,
        created_at: new Date(),
        movie: {...currentMovie},
      };

      await entry.set(entryObject);

      return res.status(200).send({
        status: "success",
        message: "movie added successfully",
        data: entryObject,
      });
    } else {
      return res.status(404).json({message: "Not found"});
    }
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).json(error.message);
  }
};

const getAllMovies = async (req: Request, res: Response) => {
  try {
    const allMovies: MovieType[] = [];
    const querySnapshot = await db.collection("movies").get();
    querySnapshot.forEach((doc: any) => allMovies.push(doc.data()));
    return res.status(200).json(allMovies);
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).json(error.message);
  }
};

const addMovie = async (req: Request, res: Response) => {
  try {
    const entry = db.collection("movies").doc();
    const entryObject = {
      id: entry.id,
      ...req.body,
    };

    await entry.set(entryObject);

    res.status(200).send({
      status: "success",
      message: "entry added successfully",
      data: entryObject,
    });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json(error.message);
  }
};

export {
  addMovie,
  findMovie,
  watchMovie,
  getAllMovies,
  addMovieToWatchlist,
  getAllMoviesToWatch,
  getWatchedMovies,
};
