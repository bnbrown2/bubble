const { ConnectContactLens } = require('aws-sdk')
const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()


router
    .route('/')
    .put( async (req, res) => {
        const { uid, postID } = req.body

        console.log(uid)
        console.log(postID)

        if (!uid || !postID) {
            console.log("missing post id or user id for post like")
            return res.status(400).json({ error: 'User ID or Post ID not provided for post like'})
        }

        try {
            const connectionPool = req.app.get('mariadbPool')
            const connection = await connectionPool.getConnection()
            const result = await connection.execute(
                'INSERT INTO likes (postID,uid) VALUES (?,?)',
                [postID, uid]
            )
            connection.release()

            const affectedRows = result ? result.affectedRows : 0
            if (affectedRows > 0) {
                return res.status(200).json({ message: 'you liked a post!'})
            } else {
                return res.status(500).json({ error: 'Post could not be liked'})
            }

        } catch (error) {
            console.log("error in try block while liking post")
            return res.status(500).json({ error: 'Internal server error'})
        }
    })
    .delete( async (req, res) => {
        const { uid, postID } = req.body

        if (!uid || !postID) {
            console.log("missing post id or user id for delete post like")
            return res.status(400).json({ error: 'User ID or Post ID not provided for delete post like'})
        }

        try {
            const connectionPool = req.app.get('mariadbPool')
            const connection = await connectionPool.getConnection()
            const result = await connection.execute(
                '',
                [uid, postID]
            )
            connection.release()

            res.status(200).json({ message: 'you unliked a post!'})
        } catch (error) {
            console.log("error in try block while deleting post like")
            return res.status(500).json({ error: 'Internal server error'})
        }
    })

module.exports = router