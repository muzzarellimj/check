const MongoClient = require("mongodb").MongoClient;
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const toMarkdown = require("json2md");
const toXML = require("jstoxml");
const toYAML = require("json-to-pretty-yaml");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const {morganChalk} = require("./utils/logger");
const URL = `http://localhost:5500`;
const ObjectId = require("mongodb").ObjectID;
const { writeFileSync, unlinkSync } = require('fs');
const { v4: generateUniqueId } = require('uuid');

require("dotenv").config();

let database;

MongoClient.connect(
	process.env.MONGODB_CONNECTION_STRING,
	{useUnifiedTopology: true},
	(error, client) => {
		if (error) return console.log(error);

		database = client.db("main");
	}
);

// Mongoose connect to database
mongoose
	.connect(process.env.MONGODB_CONNECTION_STRING, {useNewUrlParser: true})
	.then(() => console.log("MongoDB Connected..."))
	.catch(() => console.log("Error: Cannot connect to database"));

// This should come first before bodyParser
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({extended: true}));

app.set("view engine", "ejs");
app.set("views", "src/views/");

app.use("/public", express.static("public"));
app.use(methodOverride("_method"));

// Logging middileware
app.use(morganChalk);

app.listen(process.env.PORT, () => {
	console.log("Checklist application listening on port " + process.env.PORT);
});

app.get("/", (request, response) => {
	response.render("write");
});

app.post("/add", (request, response) => {
	database
		.collection("counter")
		.findOne({name: "Total Post"}, (error, findResponse) => {
			let totalPost = findResponse.totalPost;
			var tags = request.body.tag.length > 0 ? request.body.tag.split(",") : [];
			database.collection("post").insertOne(
				{
					_id: totalPost + 1,
					title: request.body.title,
					date: request.body.date,
					tags: tags,
				},
				(error) => {
					if (error) return console.log(error);

					database
						.collection("counter")
						.updateOne(
							{name: "Total Post"},
							{$inc: {totalPost: 1}},
							(error) => {
								if (error) return console.log(error);

								response.redirect(`/list`);
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

			response.render("list", {posts: postSet});
		});
});

app.delete("/delete", (request, response) => {
	request.body._id = parseInt(request.body._id);

	database.collection("post").deleteOne(request.body, (error) => {
		if (error) return console.log(error);

		database
			.collection("counter")
			.updateOne(
				{name: "Total Post"},
				{$inc: {totalPost: -1}},
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
		.findOne({_id: parseInt(request.params.id)}, (error, result) => {
			if (error) {
				console.log(error);

				response.status(500).send({
					error:
						"Error caught in retrieving file from database collection - please try again!",
				});
			} else {
				if (result != null) {
					response.render("detail", {data: result});
				} else {
					console.log(error);

					response.status(500).send({error: "result is null"});
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
		.findOne({_id: parseInt(request.params.id)}, (error, result) => {
			if (error) {
				console.log(error);

				response.status(500).send({
					error:
						"Error caught in retrieving file from database collection - please try again!",
				});
			} else {
				if (result != null) {
					response.render("edit", {data: result});
				} else {
					response.status(500).send({error: "result is null"});
				}
			}
		});
});

app.put("/edit", (request, response) => {
	var tags = request.body.tags.split(",");
	database.collection("post").updateOne(
		{_id: parseInt(request.body.id)},
		{
			$set: {
				title: request.body.title,
				date: request.body.date,
				tags: tags,
			},
		},
		() => {
			response.redirect("/list");
		}
	);
});

//searches a query. Quentin Roa
app.get("/search/:query", (request, response) => {
	nodash = request.params.query.replaceAll("-", " ");
	//regex with query that is case insensitive.
	var regex = new RegExp(nodash, "i");
	query = {title: regex};
	found = database
		.collection("post")
		.find(query)
		.toArray((error, result) => {
			if (error) return console.log(error);

			response.render("list", {posts: result});
		});
});

//sends get as query. Quentin Roa
app.get("/search", (request, response) => {
	q = request.query.q;
	q = q.replaceAll(" ", "-");
	response.redirect("/search/" + q);
});

//use to test search, when ran, it will create a post with nothing as date and the query as the title. Quentin Roa
app.get("/test/search/:query", (request, response) => {
	title = request.params.query;
	database
		.collection("counter")
		.findOne({name: "Total Post"}, (error, findResponse) => {
			let totalPost = findResponse.totalPost;

			database
				.collection("post")
				.insertOne(
					{_id: totalPost + 1, title: title, date: "0/0/0"},
					(error) => {
						if (error) return console.log(error);
						title = title.replaceAll(" ", "-");
						database
							.collection("counter")
							.updateOne(
								{name: "Total Post"},
								{$inc: {totalPost: 1}},
								(error) => {
									if (error) return console.log(error);

									response.redirect("/search/" + title);
								}
							);
					}
				);
		});
});

app.get("/convert/markdown", (request, response) => {
	database
		.collection("post")
		.find()
		.toArray((error, posts) => {
			if (error) return console.log(error);

			let data = [];

			data.push({h1: `Checklist via Check`});

			let postList = [];

			posts.forEach((post) => {
				postList.push(`${post.title} - due on ${post.date} - includes the following tags:`);
				postList.push(post.tags);
				postList.push(' ');
			});

			data.push(postList);

			let path = 'public/'
			let filename = `${generateUniqueId()}.md`;

			writeFileSync(path + filename, toMarkdown(data, null, null));

			response.download(path + filename, (error) => {
				if (error) return console.log(error);

				unlinkSync(path + filename);
			});
		});
});

app.get("/convert/xml", (request, response) => {
	database
		.collection("post")
		.find()
		.toArray((error, posts) => {
			let inner = [];

			posts.forEach((post) => {
				inner.push({
					_name: 'post',
					_content: {
						title: post.title,
						date: post.date,
						tags: {
							tag: post.tags
						}
					},
					_attrs: {
						id: post._id
					}
				});
			});

			let outer = {
				_name: 'list',
				_content: inner
			}

			let path = 'public/'
			let filename = `${generateUniqueId()}.xml`;

			writeFileSync(path + filename, toXML.toXML(outer, { indent: "    ", header: true }));

			response.download(path + filename, (error) => {
				if (error) return console.log(error);

				unlinkSync(path + filename);
			});
		});
});

app.get("/convert/yaml", (request, response) => {
	database
		.collection("post")
		.find()
		.toArray((error, posts) => {
			let data = [];

			posts.forEach((post) => {
				data.push({post: {title: post.title, date: post.date}});
			});

			let path = 'public/'
			let filename = `${generateUniqueId()}.yaml`;

			writeFileSync(path + filename, toYAML.stringify(data));

			response.download(path + filename, (error) => {
				if (error) return console.log(error);

				unlinkSync(path + filename);
			});
		});
});

app.get("/register", (req, res) => {
	res.render("register.ejs", {success: false});
});

app.post("/register", (req, res) => {
	try {
		const {firstName, lastName, email, password} = req.body;
		User.findOne({email: email}).then((user) => {
			if (user) {
				return res.status(400).render("error", {
					message: "Email is already registered. Please choose another email.",
					redirectUrl: `${URL}/register`,
				});
			} else {
				const newUser = new User({
					firstName,
					lastName,
					email,
				});
				bcrypt.genSalt(10, (_, salt) => {
					bcrypt.hash(password, salt, (error, hashedPassword) => {
						if (error) {
							return res.status(500).render("error", {
								message: "Something is not right. Please try again",
								redirectUrl: `${URL}/register`,
							});
						}
						newUser.password = hashedPassword;
						newUser
							.save()
							.then((user) => {
								return res.render("register", {
									success: true,
									data: {
										_id: user._id,
										firstName: user.firstName,
										lastName: user.lastName,
										email: user.email,
									},
									message: "You are now registered",
									code: "Created",
								});
							})
							.catch((error) =>
								res.status(500).render("error", {
									message: "Something is not right. Please try again",
									redirectUrl: `${URL}/register`,
								})
							);
					});
				});
			}
		});
	} catch (error) {
		return res.status(500).render("error", {
			message: "Something is not right. Please try again",
			redirectUrl: `${URL}/register`,
		});
	}
});

app.post("/api/register", (req, res) => {
	try {
		const {firstName, lastName, email, password} = req.body;
		User.findOne({email: email}).then((user) => {
			if (user) {
				return res.status(400).json({
					message: "Email is already registered. Please choose another email",
					code: "BadRequest",
				});
			} else {
				const newUser = new User({
					firstName,
					lastName,
					email,
				});
				bcrypt.genSalt(10, (_, salt) => {
					bcrypt.hash(password, salt, (error, hashedPassword) => {
						if (error) {
							return res.status(500).json({
								message: "Something is not right. Please try again",
								code: "InternalServerError",
								error: error,
							});
						}
						newUser.password = hashedPassword;
						newUser
							.save()
							.then((user) => {
								res.status(201).json({
									success: true,
									data: {
										_id: user._id,
										firstName: user.firstName,
										lastName: user.lastName,
										email: user.email,
									},
									message: "You are now registered",
									code: "Created",
								});
							})
							.catch((error) =>
								res.status(500).json({
									message: "Something is not right. Please try again",
									code: "InternalServerError",
									error: error,
								})
							);
					});
				});
			}
		});
	} catch (error) {
		return res.status(500).json({
			message: "Something is not right. Please try again",
			code: "InternalServerError",
			error: error,
		});
	}
});

app.delete("/unregister/:id", (req, res) => {
	try {
		const _id = req.params.id;
		User.findOne({_id: _id}).then((user) => {
			if (!user) {
				res.status(400).render("error", {
					message: "Cannot find user with this id in database.",
					redirectUrl: `${URL}/`,
				});
			} else {
				User.deleteOne({_id: _id})
					.then(() => res.status(204).redirect("/"))
					.catch((error) =>
						res.status(500).render("error", {
							message: "Something is not right. Please try again",
							redirectUrl: `${URL}/`,
						})
					);
			}
		});
	} catch (error) {
		return res.status(500).render("error", {
			message: "Something is not right. Please try again",
			redirectUrl: `${URL}/`,
		});
	}
});

app.delete("/api/unregister/:id", (req, res) => {
	try {
		const _id = req.params.id;
		User.findOne({_id: _id}).then((user) => {
			if (!user) {
				return res.status(400).json({
					message: "Cannot find user with this id in database",
					code: "BadRequest",
				});
			} else {
				User.deleteOne({_id: _id})
					.then(() =>
						res.status(204).json({
							message: "User is successfully deleted from database",
							code: "NoContent",
						})
					)
					.catch((error) =>
						res.status(500).json({
							message: "Something is not right. Please try again",
							code: "InternalServerError",
							error: error,
						})
					);
			}
		});
	} catch (error) {
		return res.status(500).json({
			message: "Something is not right. Please try again",
			code: "InternalServerError",
			error: error,
		});
	}
});

//tag page
app.get("/tags", function (req, resp) {
	database
		.collection("post")
		.find()
		.toArray(function (err, res) {
			resp.render("tags.ejs", {posts: res});
		});
});

//list with specific tags
app.get("/list/:tags", function (req, res) {
	var arr = req.params["tags"].split(",");
	database
		.collection("post")
		.find({tags: {$all: arr}})
		.toArray(function (error, resp) {
			console.log(resp);
			res.render("list.ejs", {posts: resp});
		});
});

//delete tag, all posts having that tag will not have that tag anymore
app.delete("/tags/delete", function (req, resp) {
	database
		.collection("post")
		.updateMany(
			{tags: req.body.name},
			{$pull: {tags: req.body.name}},
			function (err, res) {
				resp.send(res);
			}
		);
});

//tag adding testing
app.get("/test/tags/add", function (req, resp) {
  //insert a demo item with tags into db
  var title = "demo";
  var date = "1/1";
  var tags = ["nghitran", "ase"];
  database
    .collection("counter")
    .findOne({ name: "Total Post" }, (error, findResponse) => {
      let totalPost = findResponse.totalPost;
      database.collection("post").insertOne(
        {
          _id: totalPost + 1,
          title: title,
          date: date,
          tags: tags,
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
                //check if there exists an item that contain the inserted tags
                database
                  .collection("post")
                  .find({ tags: { $all: tags } })
                  .toArray(function (err, res) {
                    resp.send(res);
                  });
              }
            );
        }
      );
    });
});

// Export for testing
module.exports = {app};
