// Import required modules
const express = require('express')
const morgan = require('morgan')
const mysql = require('mysql2')
const bodyParser = require('body-parser');

// Importing routes
const accounts = require('./routes/accounts')

// Setting up express
const app = express()
app.use(morgan(":method :url :status :res[content-length] - :response-time ms"))
app.use(bodyParser.json())

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


// Applying routes
app.use('/account/:username', accounts);

// Way to get bio by inputting username in URL
app.get('/account/:username', async (req, res) => {
  try {
    const username = req.params.username
    console.log(`${username} entered in for username`)
    const bio = await getUser(username)
    res.send(bio[1])
  } catch (error) {
    res.send(error)
  }
})


// Default response
app.get('/', (req, res) => {
  res.send('<h style="color:blue;">Hello world! Future home of bubble! (although bubble will be an android app and not a website)</h>')
})



// Start the server
const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Listening on port ${port}`))
