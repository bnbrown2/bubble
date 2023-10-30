const express = require('express')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const sharp = require('sharp')
const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

const config = require('../../config')
const secretKey = config.secretKey

const { uploadFile } = require('../../s3')

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

            const accJSON = {
            //res.status(200).json({
                username: account.username,
                uid: account.uid,
                name: account.name,
                profile_picture: `/image/profile_picture/u/${account.uid}`,               //account.profile_picture,
                url: `/api/account/${account.username}`,
                html_url: `/account/${account.username}`,
                followers_url: `/api/account/${account.username}/followers`,
                following_url: `/api/account/${account.username}/following`,
                bubble_admin: false,                                                    // eventually get this from table
                email: account.email,
                bio: account.bio,
                followers: 0,                                                           // eventually get this from table
                following: 0,                                                           // eventually get this from table
                created_at: account.created_at,
                last_accessed_at: account.last_accessed_at,
                editable: editable,
            }

            const acceptHeader = req.get('Accept')

            if (acceptHeader.includes('application/json')) {
                res.json(accJSON)
            }

            else {
                res.set('Content-Type', 'application/json')
                res.send(JSON.stringify(accJSON, null, 2))
            }

            // res.render('account', accJSON)

        } catch (error) {
            console.error('Error fetching account:', error)
            res.status(500).json({ error: 'Internal server error'})
        }
    }).put( upload.single('image'), async (req, res) => {

        let editable = false
        const token = req.headers.authorization

        const { username } = req.params
        const { newBio, newName } = req.body
        const image = req.file

        console.log('started put account')

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

        if (!username) {
            return res.status(400).json({ error: 'Username not provided' })
        }

        try {
            const connectionPool = req.app.get('mariadbPool')
            const connection = await connectionPool.getConnection()

            let uid = []
            if (image) {
                uid = await connection.execute(
                    'SELECT uid FROM accounts WHERE username = ?',
                    [username]
                )
            }

            const result = await connection.execute(
                'UPDATE accounts SET name = ?, bio = ? WHERE username = ?',
                [newName, newBio, username]
            )
            connection.release()

            const affectedRows = result ? result.affectedRows : 0
            console.log(`${affectedRows} rows affected`)
            console.log(image)
            if (image) {
                if (!Buffer.isBuffer(image.buffer) || !image.mimetype.includes('image')) {
                    return res.status(400).json({ error: 'Invalid image data' });
                }

                const compressedImage = await sharp(image.buffer)
                .resize({ fit: 'inside', width: 800 }) // Adjust the size as needed
                .toBuffer()

                const uploadResult = await uploadFile(compressedImage, uid[0].uid)
                console.log(uploadResult)
            }

            if (affectedRows > 0) {
                return res.status(200).json({ message: `Updated ${affectedRows} row`})
            } else {
                return res.status(404).json({ error: 'Updated 0 rows'})
            }
        } catch(error) {
            console.error('Error updating account:', error)
            return res.status(500).json({ error: 'Internal server error'})
        }
    })


module.exports = router