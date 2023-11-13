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
    /*.route('/upload')
    .post( async (req, res) => {
        res.send('hello')
    })*/



module.exports = router