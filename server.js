const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Create a proxy endpoint for the AI API
app.post('/api/ai', async (req, res) => {
  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent", 
      req.body,
      {
        params: {
          key: process.env.API_KEY
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
});

app.get('/api/config', (req, res) => {
  console.log('API Key available: ', !!process.env.API_KEY);  // True if key exists
  res.json({
    API_KEY: process.env.API_KEY
  });
});

// Serve the mainn HTML file for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});