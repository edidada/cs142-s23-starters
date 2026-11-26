const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs").promises;
const path = require("path");
/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs142 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");

const express = require("express");
const app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/cs142project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


app.use(session({ secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"), resave: false, saveUninitialized: false, cookie: { httpOnly: true, sameSite: "lax" } }));
app.use(bodyParser.json());
const publicUser = user => ({ _id: user._id, first_name: user.first_name, last_name: user.last_name });
const nonempty = value => typeof value === "string" && value.trim().length > 0;
app.post("/admin/login", async function (request, response) {
  if (!nonempty(request.body.login_name) || !nonempty(request.body.password)) { response.status(400).send("Login name and password required"); return; }
  try {
    const user = await User.findOne({ login_name: request.body.login_name });
    if (!user || user.password !== request.body.password) { response.status(400).send("Invalid login name or password"); return; }
    request.session.regenerate(error => {
      if (error) { response.status(500).send("Unable to create session"); return; }
      request.session.user = publicUser(user);
      request.session.save(err => { if (err) response.status(500).send("Unable to save session"); else response.json(publicUser(user)); });
    });
  } catch (error) { response.status(500).send("Unable to login"); }
});
app.post("/admin/logout", function (request, response) {
  if (!request.session.user) { response.status(400).send("Not logged in"); return; }
  request.session.destroy(error => { if (error) response.status(500).send("Unable to logout"); else { response.clearCookie("connect.sid"); response.sendStatus(200); } });
});
app.post("/user", async function (request, response) {
  const body = request.body;
  for (const key of ["login_name", "password", "first_name", "last_name"]) {
    if (!nonempty(body[key])) { response.status(400).send(key + " must be a non-empty string"); return; }
  }
  for (const key of ["location", "description", "occupation"]) {
    if (body[key] !== undefined && typeof body[key] !== "string") { response.status(400).send(key + " must be a string"); return; }
  }
  try {
    if (await User.exists({ login_name: body.login_name })) { response.status(400).send("Login name already exists"); return; }
    const user = await User.create(Object.fromEntries(["login_name", "password", "first_name", "last_name", "location", "description", "occupation"].map(key => [key, body[key]])));
    response.json({ ...publicUser(user), login_name: user.login_name });
  } catch (error) { if (error.code === 11000) response.status(400).send("Login name already exists"); else response.status(500).send("Unable to register"); }
});
// Protect API and image reads while keeping the login page and JS/CSS public.
app.use(function (request, response, next) {
  if (/^\/(user(?:\/|$)|photosOfUser\/|commentsOfUser\/|userStats$|commentsOfPhoto\/|photos\/|test(?:\/|$)|session$|images\/)/.test(request.path) && !request.session.user) {
    response.status(401).send("Please login"); return;
  }
  next();
});
app.get("/session", function (request, response) { response.json(request.session.user); });
app.post("/commentsOfPhoto/:photoId", async function (request, response) {
  if (!/^[a-fA-F0-9]{24}$/.test(request.params.photoId) || !nonempty(request.body.comment)) { response.status(400).send("Valid photo and non-empty comment required"); return; }
  try {
    const photo = await Photo.findByIdAndUpdate(request.params.photoId, { $push: { comments: { comment: request.body.comment, user_id: request.session.user._id, date_time: new Date() } } }, { new: true });
    if (!photo) { response.status(400).send("Photo not found"); return; }
    response.json({ _id: photo._id });
  } catch (error) { response.status(500).send("Unable to add comment"); }
});
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }).single("uploadedphoto");
app.post("/photos/new", function (request, response) {
  upload(request, response, async function (error) {
    if (error || !request.file || !request.file.size) { response.status(400).send("Photo file required (maximum 10 MiB)"); return; }
    const file_name = "U" + crypto.randomBytes(16).toString("hex") + "-" + path.basename(request.file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
    const destination = path.join(__dirname, "images", file_name);
    try {
      await fs.writeFile(destination, request.file.buffer, { flag: "wx" });
      const photo = await Photo.create({ file_name, user_id: request.session.user._id, date_time: new Date(), comments: [] });
      response.json({ _id: photo._id, file_name: photo.file_name });
    } catch (err) { await fs.unlink(destination).catch(() => {}); response.status(500).send("Unable to upload photo"); }
  });
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get(["/test", "/test/:p1"], function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        // Query returned an error. We pass it back to the browser with an
        // Internal Service Error (500) error code.
        console.error("Error in /user/info:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object -
        // This is also an internal error return.
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      // We got the object - return it in JSON format.
      console.log("SchemaInfo", info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    // In order to return the counts of all the collections we need to do an
    // async call to each collections. That is tricky to do so we use the async
    // package do the work. We put the collections into array and use async.each
    // to do each .count() query.
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", async function (request, response) {
  try {
    const users = await User.find({}).select("_id first_name last_name").lean();
    response.status(200).json(users);
  } catch (error) {
    response.status(500).send("Unable to retrieve users");
  }
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", async function (request, response) {
  const id = request.params.id;
  if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    response.status(400).send("Invalid user id");
    return;
  }
  try {
    const user = await User.findById(id).select("_id first_name last_name location description occupation").lean();
    if (!user) {
      response.status(400).send("User not found");
      return;
    }
    response.status(200).json(user);
  } catch (error) {
    response.status(500).send("Unable to retrieve user");
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", async function (request, response) {
  const id = request.params.id;
  if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    response.status(400).send("Invalid user id");
    return;
  }
  try {
    const [user, photos] = await Promise.all([
      User.exists({ _id: id }),
      Photo.find({ user_id: id }).select("_id user_id comments file_name date_time").lean()
    ]);
    if (!user) {
      response.status(400).send("User not found");
      return;
    }
    const ids = [...new Set(photos.flatMap((photo) => (photo.comments || []).map((comment) => String(comment.user_id))))];
    const authors = await User.find({ _id: { $in: ids } }).select("_id first_name last_name").lean();
    const byId = new Map(authors.map((author) => [String(author._id), author]));
    const result = photos.map((photo) => ({
      _id: photo._id,
      user_id: photo.user_id,
      file_name: photo.file_name,
      date_time: photo.date_time,
      comments: (photo.comments || []).map((comment) => ({
        _id: comment._id,
        comment: comment.comment,
        date_time: comment.date_time,
        user: byId.get(String(comment.user_id)) || null
      }))
    }));
    response.status(200).json(result);
  } catch (error) {
    response.status(500).send("Unable to retrieve photos");
  }
});


// Optional views use separate APIs so mandatory response projections stay exact.
app.get("/userStats", async function (request, response) {
  try {
    const [users, photos] = await Promise.all([
      User.find({}).select("_id").lean(),
      Photo.find({}).select("user_id comments.user_id").lean()
    ]);
    const stats = new Map(users.map(user => [String(user._id), { _id: user._id, photos: 0, comments: 0 }]));
    photos.forEach(photo => {
      const owner = stats.get(String(photo.user_id));
      if (owner) owner.photos++;
      (photo.comments || []).forEach(comment => {
        const author = stats.get(String(comment.user_id));
        if (author) author.comments++;
      });
    });
    response.json([...stats.values()]);
  } catch (error) { response.status(500).send("Unable to retrieve statistics"); }
});

app.get("/commentsOfUser/:id", async function (request, response) {
  const id = request.params.id;
  if (!/^[a-fA-F0-9]{24}$/.test(id)) { response.status(400).send("Invalid user id"); return; }
  try {
    const [user, photos] = await Promise.all([
      User.exists({ _id: id }),
      Photo.find({ "comments.user_id": id }).select("_id user_id file_name comments").lean()
    ]);
    if (!user) { response.status(400).send("User not found"); return; }
    response.json(photos.flatMap(photo => (photo.comments || [])
      .filter(comment => String(comment.user_id) === id)
      .map(comment => ({ _id: comment._id,
        comment: comment.comment,
        date_time: comment.date_time,
        photo: { _id: photo._id, user_id: photo.user_id, file_name: photo.file_name } }))));
  } catch (error) { response.status(500).send("Unable to retrieve comments"); }
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
