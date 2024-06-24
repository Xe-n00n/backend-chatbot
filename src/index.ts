import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user-routes.js";
import chatRoutes from "./routes/chat-routes.js";

import { config } from "dotenv";

config();

const app = express();

// Middlewares
const cors = require('cors');

const corsOptions = {
  // Allow requests from all origins (* for all origins)
  origin: '*',

  // Optional: Specify allowed methods (defaults to GET, HEAD, PUT, PATCH, POST, DELETE)
  methods: 'GET,POST,PUT,DELETE',

  // Optional: Allow custom headers (defaults to none)
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],

  // Optional: Allow preflight requests (defaults to true for all methods not in allowedMethods)
  preflightContinue: false,

  // Optional: Expose headers in preflight requests (defaults to "*" for all headers)
  exposedHeaders: ['Authorization'],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(morgan("dev")); // for development

// routes
app.use("/api/user/", userRoutes);
app.use("/api/chat/", chatRoutes);

// Connections and Listeners
mongoose
	.connect(
		process.env.MONGO_URL
	)
	.then(() => {
		app.listen(process.env.PORT || 5000);
		console.log(
			`Server started on port ${
				process.env.PORT || 5000
			} and Mongo DB is connected`
		);
	})
	.catch((err) => {
		console.log(err);
	});
