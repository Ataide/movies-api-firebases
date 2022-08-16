import {Request, Response, NextFunction} from "express";
import {admin} from "./config/firebase";

export const authMiddleware =
(req: Request, res: Response, next: NextFunction) => {
  // Pega o header do token.
  const jwt = req.headers["authorization"]?.split(" ")[1];

  // Verifica se o token existe.status
  // O resto tá explicativo.
  if (jwt === undefined) {
    res.status(403).json({message: "Não autorizado. Toekn ausente."});
  } else {
    try {
      admin.auth().verifyIdToken(jwt).then((user) => {
        req.params.userId = user.uid;
        next();
      }).catch((_err) => {
        res.status(403).json({message: _err.message});
      });
    } catch (err: any) {
      res.status(403).json({message: err.message});
    }
  }
};
