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
        const page = req.query.p || 1
        const pageSize = req.query.ps || 10

        res.json({
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            message: 'Posts fetched successfully.'
        })
    })



module.exports = router