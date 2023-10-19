const express = require('express')
const router = express.Router()

router.route('/')   // Note: remove the .get when we pair the api with the app
.get( (req, res) => {
    res.render('login')
})

module.exports = router
