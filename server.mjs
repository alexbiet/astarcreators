// Use require and import in the same file - define require
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Node Server Modules
const express = require('express');
const path = require('path');

// File Upload Modules
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');

const app = express();

import { NFTStorage, File } from 'nft.storage'


// enable files upload
app.use(fileUpload({
    createParentPath: true
}));

//add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));

const port = process.env.PORT || 8081;

// make static folder public
app.use(express.static('static'))

// Serve home page
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/static/index.html'));
  });


app.post('/api/mint', async function(req, res) {

    // console.log(req);

    const nftName = req.body.nftName;
    const nftDescription = req.body.nftDescription;
    const name1 = req.body.name1;
    const value1 = req.body.value1;
    const name2 = req.body.name2;
    const value2 = req.body.value2;
    const name3 = req.body.name3;
    const value3 = req.body.value3;
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDc1NzI4OERlZTM2QUY3N0FjZjZEQ0YxQjBiMjY4QzQ2YjZjMGZhNzMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1MzY5ODY2Njk4NywibmFtZSI6Ik5GVFdvcmRXYWxsIn0.BBmU-k49SfLilRIbzq8ZMu6SNSZr7YCDml4NpTkouYc'
    const client = new NFTStorage({ token: token })
    let nftAttributes = []

    if (name1.length > 0 && value1.length > 0 ) {
        nftAttributes.push({
            'trait_type': name1, 
            'value': value1
        });
    }
    if (name2.length > 0 && value2.length > 0 ) {
        nftAttributes.push({
            'trait_type': name2, 
            'value': value2
        });
    }

    if (name3.length > 0 && value3.length > 0 ) {
        nftAttributes.push({
            'trait_type': name3, 
            'value': value3
        });
    }
    

    try {
        if(!req.files.nftMedia) {
            res.send({
                status: false,
                message: 'NFT Media was not uploaded.'
            });
        } else {
            let nftMedia = req.files.nftMedia;
            //console.log(nftMedia);

            const metadata = await client.store({
                name: nftName,
                description: nftDescription,
                image: new File(
                  [
                    nftMedia.data
                  ],
                  nftMedia.name,
                  { type: nftMedia.mimetype }
                ),
                attributes: nftAttributes
              });
            console.log(metadata.url)
            // ipfs://bafyreib4pff766vhpbxbhjbqqnsh5emeznvujayjj4z2iu533cprgbz23m/metadata.json
            

            //send response
            res.send({
                status: true,
                message: 'Metadata is deployed on IPFS!',
                data: {
                    metadata: metadata.url
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }

 });


// Start server
app.listen(port, () => 
  console.log(`App is listening on port ${port}.`)
);