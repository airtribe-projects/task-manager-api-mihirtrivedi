import express from 'express';
const app = express();
const PORT = 3000;

app.use(express.json());

// Enhanced in-memory store with priority and timestamps
let tasks = [
  { 
    id: 1, 
    title: "Initial Task", 
    description: "First task", 
    completed: true, 
    priority: "medium", 
    createdAt: new Date("2023-01-01") 
  }
];

// Helper: Validation including Priority
const getValidationError = (data, isUpdate = false) => {
  const { title, description, completed, priority } = data;
  const validPriorities = ['low', 'medium', 'high'];

  if (title !== undefined && (typeof title !== 'string' || title.trim() === "")) return "Invalid title";
  if (description !== undefined && (typeof description !== 'string' || description.trim() === "")) return "Invalid description";
  if (completed !== undefined && typeof completed !== 'boolean') return "Completed must be boolean";
  if (priority !== undefined && !validPriorities.includes(priority)) return "Priority must be low, medium, or high";

  if (!isUpdate && (!title || !description || !priority)) return "Title, description, and priority are required";
  return null;
};

// GET /tasks: Retrieve all with Filtering and Sorting
app.get('/tasks', (req, res) => {
  let filteredTasks = [...tasks];

  // 1. Filtering by completion status (?completed=true)
  if (req.query.completed !== undefined) {
    const isCompleted = req.query.completed === 'true';
    filteredTasks = filteredTasks.filter(t => t.completed === isCompleted);
  }

  // 2. Sorting by creation date (?sortBy=createdAt)
  if (req.query.sortBy === 'createdAt') {
    filteredTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  res.status(200).json(filteredTasks);
});

// GET /tasks/priority/:level: Retrieve tasks by priority level
app.get('/tasks/priority/:level', (req, res) => {
  const { level } = req.params;
  const prioritizedTasks = tasks.filter(t => t.priority === level.toLowerCase());
  res.status(200).json(prioritizedTasks);
});

// POST /tasks: Create with Priority and Timestamp
app.post('/tasks', (req, res) => {
  const error = getValidationError(req.body);
  if (error) return res.status(400).json({ message: error });

  const newTask = {
    id: tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1,
    ...req.body,
    createdAt: new Date() // Automatically set creation date
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT /tasks/:id: Update including Priority
app.put('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ message: "Task not found" });

  const error = getValidationError(req.body, true);
  if (error) return res.status(400).json({ message: error });

  Object.assign(task, req.body);
  res.status(200).json(task);
});

// Standard GET by ID and DELETE remain the same...
app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
});

app.get('/tasks/priority/:level', (req, res) => {
  const { level } = req.params;
  const prioritizedTasks = tasks.filter(t => t.priority === level.toLowerCase());
  res.status(200).json(prioritizedTasks);
});

app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Task not found" });
  tasks.splice(index, 1);
  res.json({ message: "Deleted" });
});

app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
