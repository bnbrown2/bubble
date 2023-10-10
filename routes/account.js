const express = require('express')
const router = express.Router()

router
    .route('/:username')
    .get((req, res) => {
        res.send(`Get User With username ${req.params.username}`)})
    .put((req, res) => {
        res.send(`Update User With username ${req.params.username}`)})
    .delete((req, res) => {
        res.send(`Delete User With username ${req.params.username}`)
    })

const users = [{name: "Kyle"}, {name: "Sally"}]

router.param('id', (req, res, next, id) => {
    req.user = users[id]
    next()
})


module.exports = router