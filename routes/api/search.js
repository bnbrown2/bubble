const express = require('express')
const router = express.Router()

router
.route('/')
.get( (req, res) => {
    res.render('search')
})
.post( async (req, res) => {
    try {
        const { searchTerm } = req.body

        if (!searchTerm) {
            return res.status(400).json({ error: 'searchTerm not provided' })
        }

        const connectionPool = req.app.get('mariadbPool')
        const connection = await connectionPool.getConnection()

        // Note to self, someday order the results depending on how many followers each account has
        // or something along those lines (because someone with more followers is more likely to be looked up)
        const [rows] = await connection.execute(
            'SELECT * FROM accounts WHERE username LIKE %?% OR name LIKE %?%',
            [`%${searchTerm}%`, `%${searchTerm}%`]
        )

        connection.release()

        if (!rows) {
            return res.status(200).json({ 'message': 'No results'})
        }

        console.log('Here are the query results:')
        console.log(rows)
        res.send('good job')

    } catch(error) {
        console.error('Error looking up accounts:', error)
        res.status(500).json({ error: 'Internal server error'})
    }

})

module.exports = router