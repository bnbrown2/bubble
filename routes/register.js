const express = require('express')
const router = express.Router()

router
    .route('/')
    .get((req, res) => {
        res.send(`Get registration`)})
    .post((req, res) => {
        res.send(`Create user`)})

const users = [{name: "Kyle"}, {name: "Sally"}]

router.param('id', (req, res, next, id) => {
    req.user = users[id]
    next()
})


module.exports = router
