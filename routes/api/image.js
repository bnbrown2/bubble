const express = require('express')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const router = express.Router()

const { uploadFile, getFileStream  } = require('../../s3')

router
    .route('/profile_picture/u/:key')
    .get( async (req, res) => {
        const key = req.params.key
        let readStream = getFileStream(`profile_picture/u/${key}`)

        readStream.on('error', (err) => {
            // Handle the error when the S3 object doesn't exist
            if (true) {//err.code === 'NoSuchKey') {
                // Serve the default profile picture instead
                const defaultReadStream = getFileStream(`profile_picture/u/default`)
                defaultReadStream.pipe(res)
            } else {
              // Handle other errors
              res.status(500).end()
            }
        })

        readStream.pipe(res)
    })

router
    .route('/posts/:username/:postID')
    .get( async (req, res) => {
        const username = req.params.username
        const postID = req.params.postID
        let readStream = getFileStream(`posts/${username}/${postID}`)

        readStream.on('error', (err) => {
            // Handle the error when the S3 object doesn't exist
            if (true) {//err.code === 'NoSuchKey') {
                // Serve the default profile picture instead
                const defaultReadStream = getFileStream(`posts/bubble/defaultPost`)
                defaultReadStream.pipe(res)
            } else {
              // Handle other errors
              res.status(500).end()
            }
        })

        readStream.pipe(res)
    })

module.exports = router