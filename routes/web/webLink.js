const express = require('express')
const axios = require('axios')
const router = express.Router()

router.route('/')
    .get( async (req, res) => {
        try {
            res.render('account')
        } catch(error) {
            res.status(400).json({'error': 'internal server error'})
        }
    })

module.exports = router