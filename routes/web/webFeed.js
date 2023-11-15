const express = require('express')
const axios = require('axios')
const router = express.Router()

router.route('/')
    .get( async (req, res) => {
        const p = parseInt(req.query.p) || 1
        const ps = parseInt(req.query.ps) || 10
    
        const apiUrl = `http://54.202.77.126:8080/api/posts/feed?p=${p}&pn=${ps}`

        try {
            const response = await axios.get(apiUrl)
            const rows = response.data
            res.render('feed', { rows: rows } )
        } catch(error) {
            res.status(400).json({'error': 'Error rendering post feed'})
        }
    })

module.exports = router