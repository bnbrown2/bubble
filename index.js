// Import required modules
const express = require('express')
const morgan = require('morgan')
const mysql = require('mysql2')
const bodyParser = require('body-parser')
const path = require('path')

// Setting up express
const app = express()
app.use(morgan(":method :url :status :res[content-length] - :response-time ms"))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'sample_files')))

// Setting up mysql
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'MyNewPass1!',
  database: process.env.MYSQL_DATABASE || 'bubbleDB',
})




// Recieves username and returns that users bio
async function getUser(username) {
  const [bio] = await pool.promise().query("SELECT bio FROM accounts WHERE username = ?", [
    username,
  ])
  return bio[0]
}

// Way to get bio by inputting username in URL
app.get('/account/:username', async (req, res) => {
  try {
    const username = req.params.username
    console.log(`${username} entered in for username`)
    const bio = await getUser(username)
    res.setHeader('Content-Type', 'text/html')
    res.send(bio)
    res.end(`account: ${username}`)
  } catch (error) {
    res.send(error)
  }
})


// Default response
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'sample_files', 'test.html'))
})



// Start the server
const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Listening on port ${port}`))
