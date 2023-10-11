const express = require('express')
const router = express.Router()

router
.route('/')
.get((req, res) => {
    res.send(`Get registration`)
})
.post((req, res) => {
    res.send(`Create user`)
})

module.exports = router
