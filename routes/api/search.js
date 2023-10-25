const express = require('express')
const router = express.Router()

router
.route('/')
.get( async (req, res) => {
    try {
        const { searchTerm } = req.query

        if (!searchTerm) {
            return res.status(400).json({ error: 'searchTerm not provided' })
        }

        const connectionPool = req.app.get('mariadbPool')
        const connection = await connectionPool.getConnection()

        // Note to self, someday order the results depending on how many followers each account has
        // or something along those lines (because someone with more followers is more likely to be looked up)
        const rows = await connection.execute(
            'SELECT profile_picture, name, username FROM accounts WHERE username LIKE ? OR name LIKE ?',
            [`%${searchTerm}%`, `%${searchTerm}%`]
        )

        connection.release()

        //res.status(200).render('search', { rows } )
        // the following code is so the response looks good if client is a browser
        const acceptHeader = req.get('Accept');

        if (acceptHeader.includes('application/json')) {
            res.json(data)
        }

        else {
            res.set('Content-Type', 'application/json')
            res.send(JSON.stringify(data, null, 2))
        }

    } catch(error) {
        console.error('Error looking up accounts:', error)
        res.status(500).json({ error: 'Internal server error'})
    }

})

module.exports = router
