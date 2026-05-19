import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import {
  clerkMiddleware,
  getAuth
} from "@clerk/express";

import transactionRoutes
from "./routes/transactionRoutes.js";

dotenv.config();

const app = express();

/* MIDDLEWARE */

app.use(cors());

app.use(express.json());

/* CLERK */

app.use(clerkMiddleware());

/* DATABASE */

mongoose.connect(
  process.env.MONGO_URI
)
.then(() => {

  console.log(
    "MongoDB Connected"
  );

})
.catch((error) => {

  console.log(error);

});

/* AUTH CHECK MIDDLEWARE */

const protectRoute =
(req, res, next) => {

  const { userId } =
  getAuth(req);
  // console.log(userId);
  
  if (!userId) {

    return res.status(401).json({

      error: "Unauthorized"

    });

  }

  req.userId = userId;

  next();

};

/* ROUTES */

app.use(

  "/api/transactions",

  protectRoute,

  transactionRoutes

);

/* TEST */

app.get("/", (req, res) => {

  res.send("API Running");

});

/* PORT */

const PORT =
process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `Server running on ${PORT}`
  );

});