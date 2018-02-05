//CLIENT
console.log('LISTENING S3');

const fs = require('fs')
const knox = require('knox');

let secrets;

if (process.env.NODE_ENV == 'production') {
    secrets = process.env;
} else {
    secrets = require('./secrets.json');
}

const client = knox.createClient({
    key: secrets.awsKey,
    secret: secrets.awsSecret,
    bucket: 'soacialnetworknash'
});

module.exports.upload = function(file) {
    return new Promise(function(resolve, reject) {
        const s3Request = client.put(file.filename, {
            'Content-Type': file.mimetype,
            'Content-Length': file.size,
            'x-amz-acl': 'public-read'
        });
        const readStream = fs.createReadStream(file.path);
        readStream.pipe(s3Request);
        s3Request.on('response', s3Response => {
            const wasSuccessful = s3Response.statusCode == 200;
            if (wasSuccessful) {
                resolve()
            }
            else {
                s3Response.statusCode == 404;
                reject()
            }
        })
    })
}
