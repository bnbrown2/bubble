const express = require('express')
const jwt = require('jsonwebtoken');
const router = express.Router()

// SHHHHHH dont tell anyone the secret password
const secretKey = 'purpleBanana'

router.route('/')
.get( (req, res) => {
    res.render('login')
}).post( async (req, res) => {
    const { username, password } = req.body

    //res.send(`Error: the password ${password} belongs to user kaiverson, not user ${username}`)
    try {
        const connection = await connectionPool.getConnection()
        const [rows, fields] = await connection.execute(
            'SELECT * FROM users WHERE username = ? AND password = ?',
            [username, password]
        )

        connection.release()

        const user = rows[0]
        if (user) {
            const token = jwt.sign({ username }, secretKey, {expiresIn: '1h' });
            res.status(200).json({ token })
        } else {
            res.status(401).json({ error: 'Invalid username or password' })
        }
    } catch (error) {
        console.error('Error authenticating user: ', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

module.exports = router
