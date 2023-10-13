const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const config = require('./config')
const secretKey = config.secretKey

router
    .route('/:username')
    .get((req, res) => {
        const { username } = req.params

        if (!username) {
            return res.status(400).json({ error: 'Username not provided' })
        }

        try {
            const connectionPool = req.app.get('mariadbPool')
            const connection = await connectionPool.getConnection()
            const timestamp = new Date().toISOString()
            console.log(`[${timestamp}] Database connection acquired!`)
    
            const [rows, fields] = await connection.execute(
                'SELECT * FROM accounts WHERE username = ?',
                [username]
            )

            connection.release()
            const timestamp2 = new Date().toISOString()
            console.log(`[${timestamp2}] Database disconnected (gracefully)`)

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Account does not exist'})
            }

            const account = rows[0]

            const token = req.headers.authorization.split(' ')[1]

            jwt.verify(token, secretKey, (err, decoded) => {
                if (err) {
                    return res.status(401).json({ error: 'Invalid token '})
                }

                const editable = decoded.username === username

                res.status(200).json({
                    name: accounts[username].name,
                    username: accounts[username].username,
                    profile_picture: accounts[username].profile_picture,
                    bio: accounts[username].bio,
                    account_created: accounts[username].account_created,
                    editable: editable
                })
            })
        } catch (error) {
            console.error('Error fetching account:', error)
            res.status(500).json({ error: 'Internal server error'})
        }
    }).put((req, res) => {
        res.send(`Update User With username ${req.params.username}`)})


module.exports = router