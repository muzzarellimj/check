const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const toMarkdown = require('json2md');
const toXML = require('jstoxml');
const toYAML = require('json-to-pretty-yaml');

require('dotenv').config();

let database;

MongoClient.connect(process.env.MONGODB_CONNECTION_STRING, { useUnifiedTopology: true }, (error, client) => {
	if (error) return console.log(error);

	database = client.db('main');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', 'src/views/');

app.use('/public', express.static('public'));
app.use(methodOverride('_method'));

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

//searches a query. Quentin Roa
app.get('/search/:query',(request,response)=>{
	nodash=request.params.query.replaceAll('-', ' ');
	//regex with query that is case insensitive.
	var regex = new RegExp(nodash,'i')
	query = { title :  regex};
	const proj = {_id: 0,title: 1,};
    found=database.collection('post').find(query).project(proj).toArray((error,result)=>{
        if(error) return console.log(error)

        response.render('list', { posts: result });

    })
})

//sends get as query. Quentin Roa
app.get('/search',(request,response)=>{
	q=request.query.q
	q=q.replaceAll(' ','-')
	response.redirect('/search/'+q)
})

//use to test search, when ran, it will create a post with nothing as date and the query as the title. Quentin Roa
app.get('/test/search/:query',(request,response)=>{
	title=request.params.query
	database.collection('counter').findOne({ name: 'Total Post' }, (error, findResponse) => {
		let totalPost = findResponse.totalPost;

		database.collection('post').insertOne({ _id: totalPost + 1, title: title, date: '0/0/0' }, (error) => {
			if (error) return console.log(error);
			title=title.replaceAll(' ','-')
			database.collection('counter').updateOne({ name: 'Total Post' }, { $inc: { totalPost: 1 } }, (error) => {
				if (error) return console.log(error);

				response.redirect('/search/'+title)
			});
		});
	});	
})

app.get('/convert/markdown', (request, response) => {
	database.collection('post').find().toArray((error, posts) => {
		if (error) return console.log(error);

		let data = [];

		data.push({ h1: `Checklist via Check` });

		let postList = [];

		posts.forEach(post => {
			postList.push(`${post.title} - due on ${post.date}`);
		});

		data.push(postList);

		response.format({ 'text/markdown': () => { response.send(toMarkdown(data, null, null)) } });
	});
});

app.get('/convert/xml', (request, response) => {
	database.collection('post').find().toArray((error, posts) => {
		let data = [];

		data.push('<checklist>');

		posts.forEach(post => {
			data.push({ post: { title: post.title, date: post.date } });
		});

		data.push('</checklist>');

		response.format({ 'application/xml': () => { response.send(toXML.toXML(data, { indent: '    ', header: true })) } });
	});
});

app.get('/convert/yaml', (request, response) => {
	database.collection('post').find().toArray((error, posts) => {
		let data = [];

		posts.forEach(post => {
			data.push({ post: { title: post.title, date: post.date } });
		});

		response.format({ 'text/yaml': () => { response.send(toYAML.stringify(data)) } });
	});
});