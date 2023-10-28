const express = require('express')
const axios = require('axios')
const router = express.Router()

router.route('/')
    .get( async (req, res) => {
    
        const apiUrl = `http://54.202.77.126:8080/api/search`

        try {
            const response = await axios.get(apiUrl)
            const rows = response.data
            res.render('search', { rows: rows } )
        } catch(error) {
            res.status(400).json({'error': 'Account probably does not exist'})
        }
    })

module.exports = router