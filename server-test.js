const express = require('express');
const app = express();
const PORT = 8080;

// Define a route and send a response
app.get('/', (req, res) => {
  res.send('<h style="color:blue;">Fuck you garcia</h>');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});