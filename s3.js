require('dotenv').config()
const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
})


// uploads a profile picture to s3
function uploadProfilePicture(dataBuffer, uid) {
    const uploadParams = {
        Bucket: bucketName,
        Body: dataBuffer,
        Key: `profile_picture/u/${uid}`,
        ContentType: 'image/jpeg'
    }

    console.log(uploadParams)

    return s3.upload(uploadParams).promise();
}
exports.uploadProfilePicture = uploadProfilePicture


// uploads a post to s3
function uploadPost(dataBuffer, key) {
    const uploadParams = {
        Bucket: bucketName,
        Body: dataBuffer,
        Key: key,
        ContentType: 'image/jpeg'
    }

    console.log(uploadParams)

    return s3.upload(uploadParams).promise();
}
exports.uploadPost = uploadPost


// downloads a file from s3
function getFileStream(fileKey) {
    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName
    }

    return s3.getObject(downloadParams).createReadStream()
}
exports.getFileStream = getFileStream