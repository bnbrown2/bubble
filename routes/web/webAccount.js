const express = require('express')
const axios = require('axios')
const router = express.Router()

router.route('/:username')
    .get( async (req, res) => {

        const username = req.params.username;
    
        const apiUrl = `http://54.202.77.126:8080/api/account/${username}`;
        const response = await axios.get(apiUrl);
        
        // Extract the user info from the API response
        const accJSON = response.data;

        // Render the HTML page using a template engine (EJS in this case)
        res.render('account', accJSON );
        //res.json(accJSON)
    })

module.exports = router