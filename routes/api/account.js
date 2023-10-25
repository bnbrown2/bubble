const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const config = require('../../config')
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
    
            const [rows] = await connection.execute(
                'SELECT * FROM accounts WHERE username = ?',
                [username]
            )

            connection.release()

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

            // const accJSON = {
            res.status(200).json({
                name: account.name,
                username: account.username,
                profile_picture: account.profile_picture,
                bio: account.bio,
                account_created: account.account_created,
                editable: editable
            })

            // res.render('account', accJSON)

        } catch (error) {
            console.error('Error fetching account:', error)
            res.status(500).json({ error: 'Internal server error'})
        }
    }).put( async (req, res) => {

        let editable = false
        const token = req.headers.authorization

        if (token) {
            const tokenParts = token.split(' ')

            if (tokenParts.length === 2 && tokenParts[0] === 'Bearer') {
                const userToken = tokenParts[1]

                jwt.verify(userToken, secretKey, (err, decoded) => {
                    if (!err && decoded.username === username) {
                        editable = true;
                    } else {
                        return res.status(400).json({ 'error': 'action is not authorized'})
                    }
                })
            }
        }



        const { username } = req.params
        const { newBio, newName, newPicture } = req.body

        if (!username) {
            return res.status(400).json({ error: 'Username not provided' })
        }

        try {
            const connectionPool = req.app.get('mariadbPool')
            const connection = await connectionPool.getConnection()
            const timestamp = new Date().toISOString()
            console.log(`[${timestamp}] account api connected to the database!`)

            if (newPicture) {
                const result = await connection.execute(
                    'UPDATE accounts SET name = ?, bio = ?, profile_picture = ? WHERE username = ?',
                    [newName, newBio, newPicture, username]
                )
            } else {
                const result = await connection.execute(
                    'UPDATE accounts SET name = ?, bio = ? WHERE username = ?',
                    [newName, newBio, username]
                )
            }
            connection.release()

            const affectedRows = result ? result.affectedRows : 0
            console.log(`${affectedRows} rows affected`)

            if (affectedRows > 0) {
                res.status(200).json({ message: `Updated ${affectedRows} row`})
            } else {
                res.status(404).json({ error: 'Updated 0 rows'})
            }
        } catch(error) {
            console.error('Error updating account:', error)
            res.status(500).json({ error: 'Internal server error'})
        }
    })


module.exports = router