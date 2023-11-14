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
    .route('/feed')
    .get( async (req, res) => {
        // Calculate the range of post indexes we need to send to the client
        const page = parseInt(req.query.p) || 1;
        const pageSize = parseInt(req.query.ps) || 10;
        const startIndex = (page - 1) * pageSize;
        const endIndex = page * pageSize;

        // Generating array of numbers between startIndex and endIndex for testing purposes
        const integerArray = Array.from({ length: endIndex - startIndex }, (_, index) => startIndex + index)

        const responseArray = ({
            page,
            pageSize,
            startIndex,
            endIndex,
            integers: integerArray,
            message: 'Posts fetched successfully.'
        })

        // the following code is so the response looks good if client is a browser
        const acceptHeader = req.get('Accept');

        if (acceptHeader.includes('application/json')) {
            res.json(responseArray)
        }

        else {
            res.set('Content-Type', 'application/json')
            res.send(JSON.stringify(responseArray, null, 2))
        }
    })


router
    .route('/upload')
    .post( upload.single('image'), async (req, res) => {
        console.log('route was called')
        let editable = false
        const token = req.headers.authorization
        const { username, caption } = req.body
        const image = req.file

        if (!username || !image) {
            return res.status(400).json({ error: 'Missing information from client' })
        }

        // TODO: add authentication by comparing token and username
        
        try {
            // Database stuff for making a post
            const connectionPool = req.app.get('mariadbPool')
            const connection = await connectionPool.getConnection()

            // Get uid. I wish we didn't need an entire query for this but I don't know any other way
            const uid = await connection.execute(
                'SELECT uid FROM accounts WHERE username = ?',
                [username]
            )
            
            // Create post row.
            const result = await connection.execute(
                'INSERT INTO posts (uid, photo, caption) VALUES (?, ?, ?) RETURNING postID',
                [uid, true, caption]
            )
            
            // TODO: determine what the key should be based off of the new post rows id
            postId = result.rows[0].postId

            connection.release()

            // POTENTIAL BUG: make sure if a post is made in rd2, a post is made in s3.
            // POTENTIAL SOLUTION: just delete the post row if uploadResult says image wasn't uploaded
            const key = `/posts/${username}/${postId}`
            const uploadResult = await uploadPost(image, key);
            console.log(uploadResult)
        } catch(error) {
            console.error('Error making post:', error)
            return res.status(500).json({ error: 'Internal server error'})
        }
        
        res.send('hello')
    })


router
    .route('/delete')
    .delete( async (req, res) => {
        res.send('hello')
    })



module.exports = router