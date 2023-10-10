/*
*   Main file for the Bubble server
*   Written in node.js
*   Code created by Ben Brown and Kai Iverson
*   
*   Helpful tip: type `npm run devStart` into the command line to run server in dev mode
*/


// Import required modules.
const express = require('express')
const morgan = require('morgan')
const mysql = require('mysql2')
const bodyParser = require('body-parser')
const path = require('path')

// Setting up app. Also adding anything app needs access to.
const app = express()
app.use(morgan(":method :url :status :res[content-length] - :response-time ms"))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'sample_files')))

// Setting up mysql pool. You can set these values in the commend line or use the default values.
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'MyNewPass1!',
  database: process.env.MYSQL_DATABASE || 'bubbleDB',
})

// Import and use routes. Routes are all in the routes folder.
const accountRouter = require('./routes/account')
const loginRouter = require('./routes/login')
const registerRouter = require('./routes/register')
app.use('/account', accountRouter)
app.use('/login', loginRouter)
app.use('/register', registerRouter)

// Start the server. You can set the port in the command line or use the default value.
const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Listening on port ${port}`))
