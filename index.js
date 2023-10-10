// Import required modules
const express = require('express')
const morgan = require('morgan')
const mysql = require('mysql2')
const bodyParser = require('body-parser')
const path = require('path')

// Setting up app
const app = express()
app.use(morgan(":method :url :status :res[content-length] - :response-time ms"))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'sample_files')))

// Setting up mysql pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'MyNewPass1!',
  database: process.env.MYSQL_DATABASE || 'bubbleDB',
})

// Import and use routes
const accountRouter = require('./routes/account')
const loginRouter = require('./routes/login')
const registerRouter = require('./routes/register')
app.use('/account', accountRouter)
app.use('/login', loginRouter)
app.use('/register', registerRouter)

// Start the server
const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Listening on port ${port}`))
