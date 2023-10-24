const express = require('express')
const axios = require('axios')
const router = express.Router()

router.route('/')
    .get( async (req, res) => {
        const searchTerm = req.query.searchTerm

        if (!searchTerm) {
            return res.render('search')
        }
    
        const apiUrl = `http://54.202.77.126:8080/api/search?searchTerm=${searchTerm}}`

        try {
            const response = await axios.get(apiUrl)
            const rows = response.data
            console.log(rows)
            res.render('search', rows )
        } catch(error) {
            res.status(400).json({'error': 'Account probably does not exist'})
        }
    })

module.exports = router