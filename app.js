const express = require('express');
const exphbs = require('express-handlebars');
const { Pool } = require('pg');
const config = require('./config');
const mongoose = require('mongoose');

const app = express();
const pool = new Pool(config.database);

app.engine('.hbs', exphbs.engine({ extname: '.hbs'}));
app.set('view engine', '.hbs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(express.static('public'));

mongoose.connect('mongodb+srv://mockingsiddu3:Livelifeom11@cluster0.dgzhymw.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(error => console.error(error));

// Define a Todo schema and model
const todoSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  todo: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    required: true
  }
});

const Todo = mongoose.model('Todo', todoSchema);

// Routes
app.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort('id');
    res.render('index', { todos, layout: false });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching todos');
  }
});


app.post('/add', async (req, res) => {
  const task = req.body.task;

  if (task) {
    const newTodo = new Todo({
      id: Math.floor(Math.random() * 1000000), // generate random ID
      todo: task,
      completed: false
    });
    await newTodo.save();
  }

  res.redirect('/');
});

// Complete a task
app.post('/complete/:id', async (req, res) => {
  const id = req.params.id;
  
  if (id) {
    try {
      const todo = await Todo.findOneAndUpdate({ id: id }, { completed: true });
      if (!todo) {
        return res.status(404).send('Todo not found');
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send('Error completing todo');
    }
  }
  
  res.redirect('/');
});



// Edit a Task GET
app.get('/edit/:id', async (req, res) => {
  const id = req.params.id;

  if (id) {
    try {
      const todo = await Todo.findOne({ id: id });
      res.render('edit', { todo, layout: false });
    } catch (err) {
      console.error(err);
      res.redirect('/');
    }
  } else {
    res.redirect('/');
  }
});

// Edit a task POST
app.post('/update/:id', async (req, res) => {
  const id = req.params.id;
  const task = req.body.todo;

  if (id && task) {
    try {
      await Todo.findOneAndUpdate({ id: id }, { todo: task });
    } catch (err) {
      console.error(err);
    }
  }

  res.redirect('/');
});
  // Add this route after the existing routes
  app.post('/delete/:id', async (req, res) => {
    const id = req.params.id;
  
    if (id) {
      await Todo.deleteOne({ id: id }).exec();
    }
  
    res.redirect('/');
  });
  
  const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});