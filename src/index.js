const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const User = require('./models/User')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const { morganChalk } = require('./utils/logger')
const URL = `http://localhost:5500`

require('dotenv').config();

let database;

MongoClient.connect(process.env.MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, (error, client) => {
	if (error) return console.log(error);

	database = client.db('main');
});

// Mongoose connect to database
mongoose.connect(process.env.MONGODB_CONNECTION_STRING, { useNewUrlParser: true })
	.then(() => console.log('MongoDB Connected...'))
	.catch(() => console.log('Error: Cannot connect to database'))

// This should come first before bodyParser
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', 'src/views/');

app.use('/public', express.static('public'));
app.use(methodOverride('_method'));

// Logging middileware
app.use(morganChalk)

app.listen(process.env.PORT, () => {
	console.log('Checklist application listening on port ' + process.env.PORT);
});

app.get('/', (request, response) => {
	response.render('write');
});

app.post('/add', (request, response) => {
	database.collection('counter').findOne({ name: 'Total Post' }, (error, findResponse) => {
		let totalPost = findResponse.totalPost;

		database.collection('post').insertOne({ _id: totalPost + 1, title: request.body.title, date: request.body.date }, (error) => {
			if (error) return console.log(error);

			database.collection('counter').updateOne({ name: 'Total Post' }, { $inc: { totalPost: 1 } }, (error) => {
				if (error) return console.log(error);

				response.send('Successfully stored in the database!')
			});
		});
	});
});

app.get('/list', (request, response) => {
	database.collection('post').find().toArray((error, postSet) => {
		if (error) return console.log(error);

		response.render('list', { posts: postSet });
	});
});

app.delete('/delete', (request, response) => {
	request.body._id = parseInt(request.body._id);

	database.collection('post').deleteOne(request.body, (error) => {
		if (error) return console.log(error);

		database.collection('counter').updateOne({ name: 'Total Post' }, { $inc: { totalPost: -1 } }, (error) => {
			if (error) return console.log(error);

			response.send('Deletion successful!');
		});
	});
});

app.get('/detail/:id', (request, response) => {
	database.collection('post').findOne({ _id: parseInt(request.params.id) }, (error, result) => {
		if (error) {
			console.log(error);

			response.status(500).send({ error: 'Error caught in retrieving file from database collection - please try again!' });

		} else {
			if (result != null) {
				response.render('detail', { data: result });

			} else {
				console.log(error);

				response.status(500).send({ error: 'result is null' });
			}
		}
	});
});

app.post('/edit', (request, response) => {
	response.redirect(`/edit/${request.body.id}`);
});

app.get('/edit/:id', (request, response) => {
	database.collection('post').findOne({ _id: parseInt(request.params.id) }, (error, result) => {
		if (error) {
			console.log(error);

			response.status(500).send({ error: 'Error caught in retrieving file from database collection - please try again!' });

		} else {
			if (result != null) {
				response.render('edit', { data: result });

			} else {
				response.status(500).send({ error: 'result is null' });
			}
		}
	});
});

app.put('/edit', (request, response) => {
	database.collection('post').updateOne({ _id: parseInt(request.body.id) }, {$set: { title: request.body.title, date: request.body.date }}, () => {
		response.redirect('/list');
	});
});

app.get('/register', (req, res) => {
	res.render('register.ejs')
})

app.post('/register', (req, res) => {
	try {
		const { firstName, lastName, email, password } = req.body
		User.findOne({ email: email })
			.then(user => {
				if (user) {
					return res.status(400).render('error', { message: 'Email is already registered. Please choose another email.', redirectUrl: `${URL}/register` })
				} else {
					const newUser = new User({
						firstName, 
						lastName, 
						email
					})
					bcrypt.genSalt(10, (_, salt) => {
						bcrypt.hash(password, salt, (error, hashedPassword) => {
							if (error) {
								return res.status(500).render('error', { message: 'Something is not right. Please try again', redirectUrl: `${URL}/register` })
							}
							newUser.password = hashedPassword
							newUser.save()
								.then(user => {
									return res.render('register', {
										success: true,
										data: {
											_id: user._id,
											firstName: user.firstName,
											lastName: user.lastName,
											email: user.email
										},
										message: "You are now registered",
										code: "Created"
									})
								})
								.catch(error => res.status(500).render('error', { message: 'Something is not right. Please try again', redirectUrl: `${URL}/register` }))
						})
					})
				}
			})
	}
	catch (error) {
		return res.status(500).render('error', { message: 'Something is not right. Please try again', redirectUrl: `${URL}/register` })
	}
})

app.post('/api/register', (req, res) => {
	try {
		const { firstName, lastName, email, password } = req.body
		User.findOne({ email: email })
			.then(user => {
				if (user) {
					return res.status(400).json({ message: 'Email is already registered. Please choose another email', code: "BadRequest"})
				} else {
					const newUser = new User({
						firstName, 
						lastName, 
						email
					})
					bcrypt.genSalt(10, (_, salt) => {
						bcrypt.hash(password, salt, (error, hashedPassword) => {
							if (error) {
								return res.status(500).json({ message: "Something is not right. Please try again", code: "InternalServerError", error: error })
							}
							newUser.password = hashedPassword
							newUser.save()
								.then(user => {
									res.status(201).json({
										success: true,
										data: {
											_id: user._id,
											firstName: user.firstName,
											lastName: user.lastName,
											email: user.email
										},
										message: "You are now registered",
										code: "Created"
									})
								})
								.catch(error => res.status(500).json({ message: 'Something is not right. Please try again', code: 'InternalServerError', error: error }))
						})
					})
				}
			})
		
	}
	catch (error) {
		return res.status(500).json({ message: 'Something is not right. Please try again', code: 'InternalServerError', error: error })
	}
})

app.delete('/unregister/:id', (req, res) => {
	try {
		const _id = req.params.id
		User.findOne({ _id: _id })
			.then(user => {
				if (!user) {
					res.status(400).render('error', { message: 'Cannot find user with this id in database.', redirectUrl: `${URL}/` })
				} else {
					User.deleteOne({ _id: _id})
						.then(() => res.status(204).redirect('/'))
						.catch(error => res.status(500).render('error', { message: 'Something is not right. Please try again', redirectUrl: `${URL}/` }))
				}
			})
	}
	catch (error) {
		return res.status(500).render('error', { message: 'Something is not right. Please try again', redirectUrl: `${URL}/` })
	}
})

app.delete('/api/unregister/:id', (req, res) => {
	try {
		const _id = req.params.id
		User.findOne({ _id: _id })
			.then(user => {
				if (!user) {
					return res.status(400).json({ message: 'Cannot find user with this id in database', code: 'BadRequest' })
				} else {
					User.deleteOne({ _id: _id})
						.then(() => res.status(204).json({ message: 'User is successfully deleted from database', code: 'NoContent'}))
						.catch(error => res.status(500).json({ message: 'Something is not right. Please try again', code: 'InternalServerError', error: error }))
				}
			})
	}
	catch (error) {
		return res.status(500).json({ message: 'Something is not right. Please try again', code: 'InternalServerError', error: error })
	}
})

// Export for testing
module.exports = { app }