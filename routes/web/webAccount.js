const express = require('express')
const axios = require('axios')
const router = express.Router()

router.route('/:username')
    .get( async (req, res) => {
        const username = req.params.username
    
        const apiUrl = `http://54.202.77.126:8080/api/account/${username}`

        try {
            const response = await axios.get(apiUrl)
            const accJSON = response.data
            res.render('account', accJSON )
        } catch(error) {
            res.status(400).json({'error': error})
        }
    })

module.exports = router