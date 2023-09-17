import express from "express";
import { initConnection } from "./db/connection.js";
import userRoutes from "./modules/user/user.routes.js";
import taskRoutes from "./modules/task/task.routes.js";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { authenticateTokenCookie } from "./middleware/authenticateToken.js";

// Configure Multer for file uploads

import path from "path";
import hbs from "hbs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templatePath = path.join(__dirname, "../../templates");

const app = express();
const port = 3000;

// Parse URL-encoded bodies (for 'application/x-www-form-urlencoded')
// app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));

app.use(bodyParser.json({ limit: "35mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "35mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(bodyParser.raw({ type: "image/*" }));

//use cookieParser to get
app.use(cookieParser());

// Parse JSON bodies (for 'application/json')
//app.use(bodyParser.json());

app.use(cors({ origin: "*" })); //? allows all requests from anywhere to my server (better to specify later after going live in production)

//! View engine
app.set("view engine", "hbs");
app.set("views", templatePath);
hbs.registerAsyncHelper("readFile", function (filename, callback) {
  fs.readFile(path.join(__dirname, filename), "utf8", callback);
});

app.set("view engine", "hbs"); //?This will render .hbs files when res.render is called.

app.get("/", (req, res) => {
  res.render("../templates/home"); //? Renders login.hbs
});

app.get("/login", (req, res) => {
  res.render("../templates/login"); //? Renders login.hbs
});

app.get("/signup", (req, res) => {
  res.render("../templates/signup"); ////? Renders signUp.hbs when accessing "/signup"
});

app.get("/profile", authenticateTokenCookie, (req, res) => {
  res.render("../templates/profile"); ////? Renders signUp.hbs when accessing "/signup"
});
app.get("/userSettings", authenticateTokenCookie, (req, res) => {
  res.render("../templates/userSettings"); ////? Renders signUp.hbs when accessing "/signup"
});

initConnection();

app.use(userRoutes);
app.use(taskRoutes);

app.listen(port, () => console.log(`App is running on port ${port}!`));
