const express = require('express')
const axios = require('axios')
const router = express.Router()

router.route('/:username')
    .get( async (req, res) => {
        const username = req.params.username
    
        const apiUrl = `http://54.202.77.126:8080/api/account/${username}`
        const response = await axios.get(apiUrl)
        
        // Extract the user info from the API response
        if (!response.data) {
            res.json({error: 'account does not exist'})
            return
        }
        const accJSON = response.data


        res.render('account', accJSON )
    })

module.exports = router