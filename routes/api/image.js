const express = require('express')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const router = express.Router()

const { uploadFile, getFileStream  } = require('../../s3')

router
    .route('/profile_picture/u/:key')
    .get( async (req, res) => {
        console.log("hello")
        const key = req.params.key
        var readStream = getFileStream(`profile_picture/u/${key}`)

        readStream.on('error', (err) => {
            // Handle the error when the S3 object doesn't exist
            if (err.code === 'NoSuchKey') {
              // Serve the default profile picture instead
              readStream = getFileStream(`profile_picture/u/default`)
            } else {
              // Handle other errors
              res.status(500).end()
            }
        })

        readStream.pipe(res)
    })

module.exports = router