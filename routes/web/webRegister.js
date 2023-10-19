const express = require('express')
const router = express.Router()

router
.route('/')
.get((req, res) => {
    res.render('register')
}).post( async (req, res) => {
    
})

module.exports = router
