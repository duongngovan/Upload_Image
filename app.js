const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const crypto = require('crypto');
const path = require('path');

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const config = require('./config')
const image = require('./routes/image')
const GridFsStorage = require('multer-gridfs-storage');
const multer = require('multer');

const url = config.mongoURI;
const mongoDB = process.env.MONGODB_URI || url;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Database connected');
    })
    .catch((error) => {
        console.log('Error connecting to database');
    });
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const storage = new GridFsStorage({
    url: config.mongoURI,   
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({ storage });

app.use("/", image(upload));



const port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log(`Listening on port ${port}...`)
});