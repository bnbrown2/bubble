const express = require('express')
const morgan = require('morgan')
const mysql = require('mysql2')

const app = express()

app.use(morgan(":method :url :status :res[content-length] - :response-time ms"))

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
})



async function getUser(username) {
  const [bio] = await pool.promise().query("SELECT bio FROM User WHERE username = ?", [
    username,
  ])
  return bio[0]
}

// Define a route and send a response
app.get('/', (req, res) => {
  res.send('<h style="color:blue;">Hello world! Future home of bubble! (although bubble will be an android app and not a website)</h>')
})

app.get('/:username', async (req, res) => {
  try {
    const username = req.params.username
    console.log(`${username} entered in for username`)
    const bio = await getUser(username)
    res.send(bio)
  } catch (error) {
    res.send(error)
  }
})


// Start the server
const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Listening on port ${port}`))