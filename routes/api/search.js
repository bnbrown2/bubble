const express = require('express')
const router = express.Router()

router
.route('/')
.get( async (req, res) => {
    try {
        const { searchTerm } = req.query

        const connectionPool = req.app.get('mariadbPool')
        const connection = await connectionPool.getConnection()

        // Note to self, someday order the results depending on how many followers each account has
        // or something along those lines (because someone with more followers is more likely to be looked up)
        let rows = []

        if (searchTerm) {
            rows = await connection.execute(
                'SELECT profile_picture, name, username, uid FROM accounts WHERE username LIKE ? OR name LIKE ?',
                [`%${searchTerm}%`, `%${searchTerm}%`]
            )
        } else {
            rows = await connection.execute(
                'SELECT profile_picture, name, username, uid FROM accounts'
            )
        }

        connection.release()

        const responseArray = rows.map((account) => ({
            username: account.username,
            uid: account.uid,
            name: account.name,
            profile_picture: `/image/profile_picture/u/${account.uid}`,
            url: `/api/account/${account.username}`,
            html_url: `/account/${account.username}`,
            followers_url: `/api/account/${account.username}/followers`,
            following_url: `/api/account/${account.username}/following`,
            bio: account.bio
        }))



        //res.status(200).render('search', { rows } )
        // the following code is so the response looks good if client is a browser
        const acceptHeader = req.get('Accept')

        if (acceptHeader.includes('application/json')) {
            res.json(responseArray)
        }

        else {
            res.set('Content-Type', 'application/json')
            res.send(JSON.stringify(responseArray, null, 2))
        }

    } catch(error) {
        console.error('Error looking up accounts:', error)
        res.status(500).json({ error: 'Internal server error'})
    }

})

module.exports = router
