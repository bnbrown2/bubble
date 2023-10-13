const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const config = require('../config')
const secretKey = config.secretKey

router
    .route('/:username')
    .get( async (req, res) => {
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

            if (!rows) {
                return res.status(404).json({ error: 'Account does not exist'})
            }

            const account = rows


            let editable = false
            const token = req.headers.authorization

            if (token) {
                const tokenParts = token.split(' ')

                if (tokenParts.length === 2 && tokenParts[0] === 'Bearer') {
                    const userToken = tokenParts[1]

                    jwt.verify(userToken, secretKey, (err, decoded) => {
                        if (!err && decoded.username === username) {
                          editable = true;
                        }
                      })
                }
            }

            res.status(200).json({
                name: account.name,
                username: account.username,
                profile_picture: account.profile_picture,
                bio: account.bio,
                account_created: account.account_created,
                editable: editable
            })
        } catch (error) {
            console.error('Error fetching account:', error)
            res.status(500).json({ error: 'Internal server error'})
        }
    }).put((req, res) => {
        res.send(`Update User With username ${req.params.username}`)})


module.exports = router