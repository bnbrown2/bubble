const express = require('express')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const sharp = require('sharp')
const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

const config = require('../../config')
const secretKey = config.secretKey

const { uploadFile, uploadProfilePicture, uploadPost } = require('../../s3')
const { ConnectContactLens } = require('aws-sdk')





function timeAgo(timestamp) {
    const previous = new Date(timestamp).getTime();
    const current = new Date().getTime();
    const elapsed = current - previous;
    
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerWeek = msPerDay * 7;
    const msPerYear = msPerDay * 365;
    
    if (elapsed < msPerMinute) {
        const seconds = Math.round(elapsed / 1000);
        return seconds + 's';
    } else if (elapsed < msPerHour) {
        const minutes = Math.round(elapsed / msPerMinute);
        return minutes + 'm';
    } else if (elapsed < msPerDay) {
        const hours = Math.round(elapsed / msPerHour);
        return hours + 'h';
    } else if (elapsed < msPerWeek) {
        const days = Math.round(elapsed / msPerDay);
        return days + 'd';
    } else if (elapsed < msPerYear) {
        const weeks = Math.round(elapsed / msPerWeek);
        return weeks + 'w';
    } else {
        const years = Math.round(elapsed / msPerYear);
        return years + 'y';
    }
}





router
    .route('/feed')
    .get( async (req, res) => {
        // Calculate the range of post indexes we need to send to the client
        const page = parseInt(req.query.p) || 1;
        const pageSize = parseInt(req.query.ps) || 10;
        const startIndex = (page - 1) * pageSize;
        const endIndex = page * pageSize;

        try {
            // Database stuff for making a post
            const connectionPool = req.app.get('mariadbPool')
            const connection = await connectionPool.getConnection()

            let result = []
            result = await connection.execute(
                'SELECT posts.*, accounts.username AS username, accounts.name AS name FROM posts JOIN accounts ON posts.uid = accounts.uid order by postID DESC limit ? offset ?',
                [pageSize, (page-1) * pageSize]
            )

            connection.release()

            const responseArray = result.map((account) => ({
                postID: account.postID,
                uid: account.uid,
                photo: account.photo,
                photo_url: `/image/posts/${account.username}/${account.postID}`,
                caption: account.caption,
                timeAgo: timeAgo(account.created_at),
                username: account.username,
                name: account.name,
                profile_picture: `/image/profile_picture/u/${account.uid}`,
                url: `/api/account/${account.username}`,
                html_url: `/account/${account.username}`
            }))

            const acceptHeader = req.get('Accept')
            if (acceptHeader.includes('application/json')) {
                res.json(responseArray)
            } else {
                res.set('Content-Type', 'application/json')
                res.send(JSON.stringify(responseArray, null, 2))
            }


        } catch(error) {
            console.error('Error making post feed:', error)
            return res.status(500).json({ error: 'Internal server error'})
        }



        /*// Generating array of numbers between startIndex and endIndex for testing purposes
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
        const acceptHeader = req.get('Accept');*/

    })


router
    .route('/upload')
    .post( upload.single('image'), async (req, res) => {
        console.log('route was called')
        let editable = false
        const token = req.headers.authorization
        const { username, caption } = req.body
        const image = req.file

        if (!username) {
            console.log('no username')
            return res.status(400).json({ error: 'Missing information from client' })
        }


        // TODO: add authentication by comparing token and username
        
        try {
            // Database stuff for making a post
            const connectionPool = req.app.get('mariadbPool')
            const connection = await connectionPool.getConnection()

            console.log(username)

            let uid = []
            uid = await connection.execute(
                'SELECT uid FROM accounts WHERE username = ?',
                [username]
            )

            const hasImage = !!image ?? false
            
            // Create post row.
            let result = []
            result = await connection.execute(
                'INSERT INTO posts (uid, photo, caption) VALUES (?, ?, ?)',
                [uid[0].uid, hasImage, caption]
            )
            
            // Get postID
            const postIdResult = await connection.execute(
                'SELECT LAST_INSERT_ID() as postID'
            )
            console.log(postIdResult)
            const postId = postIdResult[0].postID;

            connection.release()

            const affectedRows = result ? result.affectedRows : 0

            // POTENTIAL BUG: make sure if a post is made in rd2, a post is made in s3.
            // POTENTIAL SOLUTION: just delete the post row if uploadResult says image wasn't uploaded
            if (image) {
                const compressedImage = await sharp(image.buffer)
                    .resize({ width: 450 })
                    .jpeg({ quality: 75 })

                const key = `posts/${username}/${postId}`
                const uploadResult = await uploadPost(compressedImage, key);
                console.log(uploadResult)
            }

            if (affectedRows > 0) {
                return res.status(200).json({ message: `Updated ${affectedRows} row`})
            } else {
                return res.status(404).json({ error: 'Updated 0 rows'})
            }

        } catch(error) {
            console.error('Error making post:', error)
            return res.status(500).json({ error: 'Internal server error'})
        }
    })


router
    .route('/delete')
    .delete( async (req, res) => {
        res.send('hello')
    })



module.exports = router