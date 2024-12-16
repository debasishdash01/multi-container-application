const express = require('express'); // Import Express for creating the API
const bodyParser = require('body-parser'); // Middleware for parsing request bodies, Helps parse JSON data sent by users
const mongoose = require('mongoose'); // Library to interact with MongoDB

// Initialize the app
const app = express(); 

//Middleware to enable parsing JSON requests
app.use(bodyParser.json());

// MongoDB Connection, will create todo-app database, if not aleardy created
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todo-app';

// Connect to MongoDB using Mongoose
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Define a Todo schema (structure of the data)
const todoSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Title of the todo (required)
    description: { type: String, default: '' }, // Description of the todo
    completed: { type: Boolean, default: false }, // Whether the todo is completed with default value of false
  });

// Create a model from the schema, and pass a name of the model and the schema as argument
const Todo = mongoose.model('Todo', todoSchema);

// API Endpoints

// 1. GET /todos - Get all todos
app.get('/todos', async (req, res) => {
    try {
      const todos = await Todo.find(); // Fetch all todos from the database
      res.status(200).json(todos); // Respond with a JSON array of todos
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch todos' }); // Handle errors
    }
  });

// 2. POST /todos - Create a new todo
app.post('/todos', async (req, res) => {
    try {
      const savedTodo = await Todo.create(req.body); // Create and save in one step
      res.status(201).json(savedTodo); // Respond with the saved todo
    } catch (err) {
      res.status(400).json({ error: 'Failed to create todo' }); // Handle validation errors
    }
  });
  
// 3. GET /todos/:id - Get a single todo by ID
  app.get('/todos/:id', async (req, res) => {
    try {
      const todo = await Todo.findById(req.params.id); // Find a todo by its ID
      if (!todo) return res.status(404).json({ error: 'Todo not found' }); // If not found, respond with 404
      res.status(200).json(todo); // Respond with the todo
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch todo' }); // Handle errors
    }
  });

// 4. PUT /todos/:id - Update a single todo by ID
app.put('/todos/:id', async (req, res) => {
    try {
      const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // Return the updated document
        runValidators: true, // Run schema validation on update
      });
      if (!updatedTodo) return res.status(404).json({ error: 'Todo not found' }); // If not found, respond with 404
      res.status(200).json(updatedTodo); // Respond with the updated todo
    } catch (err) {
      res.status(400).json({ error: 'Failed to update todo' }); // Handle validation errors
    }
  });

// 5. DELETE /todos/:id - Delete a single todo by ID
app.delete('/todos/:id', async (req, res) => {
    try {
      const deletedTodo = await Todo.findByIdAndDelete(req.params.id); // Find and delete a todo by its ID
      if (!deletedTodo) return res.status(404).json({ error: 'Todo not found' }); // If not found, respond with 404
      res.status(200).json({ message: 'Todo deleted successfully' }); // Respond with success message
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete todo' }); // Handle errors
    }
  });
  
// Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });