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
const mariadb = require('mariadb')
const bodyParser = require('body-parser')
const path = require('path')

// Setting up mysql pool. You can set these values in the commend line or use the default values.
const pool = mariadb.createPool({
  host: process.env.MARIADB_HOST || 'bubble.cdqqssnxe7h2.us-west-2.rds.amazonaws.com',
  user: process.env.MARIADB_USER || 'admin',
  password: process.env.MARIADB_PASSWORD || 'twd2mBqEVFVTNktqBYpY',
  database: process.env.MARIADB_DATABASE || 'bubble',
})

// Setting up app. Also adding anything app needs access to.
const app = express()
app.use(morgan(":method :url :status :res[content-length] - :response-time ms"))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'sample_files')))
app.use(express.static("public"))
app.use(express.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.set('mariadbPool', pool)

// Import and use api routes. Routes are all in the /routes/api folder.
const accountRouter = require('./routes/api/account')
const loginRouter = require('./routes/api/login')
const registerRouter = require('./routes/api/register')
app.use('/api/account', accountRouter)
app.use('/api/login', loginRouter)
app.use('/api/register', registerRouter)

// Import and use web routes. Routes are all in the /routes/web folder.
const accountRouter = require('./routes/web/webAccount')
const loginRouter = require('./routes/web/webLogin')
const registerRouter = require('./routes/web/webRegister')
app.use('/account', accountRouter)
app.use('/login', loginRouter)
app.use('/register', registerRouter)

app.get('/', (req, res) => {
  res.redirect('/login')
})

// Start the server. You can set the port in the command line or use the default value.
const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Listening on port ${port}`))
