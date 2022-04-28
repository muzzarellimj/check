const MongoClient = require("mongodb").MongoClient;
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const methodOverride = require("method-override");

require("dotenv").config();

let database;

MongoClient.connect(
  process.env.MONGODB_CONNECTION_STRING,
  { useUnifiedTopology: true },
  (error, client) => {
    if (error) return console.log(error);

    database = client.db("main");
  }
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "src/views/");

app.use("/public", express.static("public"));
app.use(methodOverride("_method"));

app.listen(process.env.PORT, () => {
  console.log("Checklist application listening on port " + process.env.PORT);
});
app.get("/tags", function (req, resp) {
  db.collection("tags")
    .find()
    .toArray(function (error, res) {
      //   console.log(res);
      resp.render("tags.ejs", { tags: res });
    });
});

app.post("/tags/add", function (req, resp) {
  console.log(req.body);

  db.collection("tags").insertOne(
    { name: req.body.name },
    function (error, res) {
      if (error) {
        return console.log(error);
      }
      resp.send({ id: res.insertedId.toString(), name: req.body.name });
    }
  );
});

app.delete("/tags/delete", function (req, resp) {
  //   req.body._id = parseInt(req.body._id); // the body._id is stored in string, so change it into an int value
  console.log(req.body._id);
  db.collection("tags").deleteOne(
    { _id: ObjectId(`${req.body._id}`) },
    function (error, res) {
      if (error) {
        return console.log(error);
      }
      resp.send("success");
    }
  );
});

app.put("/tags/edit", function (req, resp) {
  db.collection("tags").updateOne(
    { _id: ObjectId(`${req.body.id}`) },
    { $set: { name: req.body.name } },
    function () {
      resp.redirect("/tags");
    }
  );
});
app.get("/", (request, response) => {
  response.render("write");
});

app.post("/add", (request, response) => {
  database
    .collection("counter")
    .findOne({ name: "Total Post" }, (error, findResponse) => {
      let totalPost = findResponse.totalPost;

      database
        .collection("post")
        .insertOne(
          {
            _id: totalPost + 1,
            title: request.body.title,
            date: request.body.date,
          },
          (error) => {
            if (error) return console.log(error);

            database
              .collection("counter")
              .updateOne(
                { name: "Total Post" },
                { $inc: { totalPost: 1 } },
                (error) => {
                  if (error) return console.log(error);

                  response.send("Successfully stored in the database!");
                }
              );
          }
        );
    });
});

app.get("/list", (request, response) => {
  database
    .collection("post")
    .find()
    .toArray((error, postSet) => {
      if (error) return console.log(error);

      response.render("list", { posts: postSet });
    });
});

app.delete("/delete", (request, response) => {
  request.body._id = parseInt(request.body._id);

  database.collection("post").deleteOne(request.body, (error) => {
    if (error) return console.log(error);

    database
      .collection("counter")
      .updateOne(
        { name: "Total Post" },
        { $inc: { totalPost: -1 } },
        (error) => {
          if (error) return console.log(error);

          response.send("Deletion successful!");
        }
      );
  });
});

app.get("/detail/:id", (request, response) => {
  database
    .collection("post")
    .findOne({ _id: parseInt(request.params.id) }, (error, result) => {
      if (error) {
        console.log(error);

        response
          .status(500)
          .send({
            error:
              "Error caught in retrieving file from database collection - please try again!",
          });
      } else {
        if (result != null) {
          response.render("detail", { data: result });
        } else {
          console.log(error);

          response.status(500).send({ error: "result is null" });
        }
      }
    });
});

app.post("/edit", (request, response) => {
  response.redirect(`/edit/${request.body.id}`);
});

app.get("/edit/:id", (request, response) => {
  database
    .collection("post")
    .findOne({ _id: parseInt(request.params.id) }, (error, result) => {
      if (error) {
        console.log(error);

        response
          .status(500)
          .send({
            error:
              "Error caught in retrieving file from database collection - please try again!",
          });
      } else {
        if (result != null) {
          response.render("edit", { data: result });
        } else {
          response.status(500).send({ error: "result is null" });
        }
      }
    });
});

app.put("/edit", (request, response) => {
  database
    .collection("post")
    .updateOne(
      { _id: parseInt(request.body.id) },
      { $set: { title: request.body.title, date: request.body.date } },
      () => {
        response.redirect("/list");
      }
    );
});
