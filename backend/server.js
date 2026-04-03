/**
 * Life Admin AI - Backend Server
 * Express.js API with file upload and AI processing
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { processTextToTask, simulateOCR, generateDemoTasks } = require('./processText');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed.'));
    }
  }
});

// In-memory task storage
let tasks = [];

// ========================
// API ENDPOINTS
// ========================

/**
 * POST /api/upload
 * Upload a file and process it into tasks
 */
app.post('/api/upload', upload.single('document'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please select a file.'
      });
    }

    console.log(`📄 File received: ${req.file.originalname}`);

    // Simulate OCR extraction
    const extractedText = simulateOCR(req.file.originalname);
    console.log(`🔍 Extracted text: "${extractedText.substring(0, 100)}..."`);

    // Process text into tasks using AI logic
    const newTasks = processTextToTask(extractedText);
    console.log(`✅ Generated ${newTasks.length} task(s)`);

    // Store tasks
    tasks.push(...newTasks);

    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Failed to clean up file:', err);
    });

    res.json({
      success: true,
      message: `Successfully extracted ${newTasks.length} task(s) from your document`,
      extractedText,
      tasks: newTasks
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process document. Please try again.'
    });
  }
});

/**
 * POST /api/process-text
 * Process raw text directly into tasks
 */
app.post('/api/process-text', (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No text provided.'
      });
    }

    const newTasks = processTextToTask(text);
    tasks.push(...newTasks);

    res.json({
      success: true,
      message: `Successfully extracted ${newTasks.length} task(s)`,
      tasks: newTasks
    });
  } catch (error) {
    console.error('Process error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process text.'
    });
  }
});

/**
 * GET /api/tasks
 * Return all stored tasks
 */
app.get('/api/tasks', (req, res) => {
  const { category, sort } = req.query;

  let filteredTasks = [...tasks];

  // Filter by category
  if (category && category !== 'All') {
    filteredTasks = filteredTasks.filter(t => t.category === category);
  }

  // Sort by deadline
  if (sort === 'deadline') {
    filteredTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  } else if (sort === 'urgency') {
    const urgencyOrder = { High: 0, Medium: 1, Low: 2 };
    filteredTasks.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
  } else {
    // Default: sort by creation date (newest first)
    filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  res.json({
    success: true,
    count: filteredTasks.length,
    tasks: filteredTasks
  });
});

/**
 * DELETE /api/tasks/:id
 * Delete a specific task
 */
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  tasks.splice(index, 1);
  res.json({ success: true, message: 'Task deleted' });
});

/**
 * POST /api/demo
 * Load demo/sample tasks
 */
app.post('/api/demo', (req, res) => {
  const demoTasks = generateDemoTasks();
  tasks.push(...demoTasks);

  res.json({
    success: true,
    message: `Loaded ${demoTasks.length} sample tasks`,
    tasks: demoTasks
  });
});

/**
 * DELETE /api/tasks
 * Clear all tasks
 */
app.delete('/api/tasks', (req, res) => {
  tasks = [];
  res.json({ success: true, message: 'All tasks cleared' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║   🧠 Life Admin AI - Backend Server           ║
  ║   Running on http://localhost:${PORT}            ║
  ║   API Docs: /api/health                       ║
  ╚═══════════════════════════════════════════════╝
  `);
});
