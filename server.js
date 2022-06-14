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

// sendFile will go here
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/static/index.html'));
  });


app.post('/api/mint', async function(req, res) {
    console.log(req);
    // const nftMedia = req.body.nftMedia;
    const nftName = req.body.nftName;
    const nftDescription = req.body.nftDescription;
    const name1 = req.body.name1;
    const value1 = req.body.value1;
    const name2 = req.body.name2;
    const value2 = req.body.value2;
    const name3 = req.body.name3;
    const value3 = req.body.value3;

    try {
        if(!req.files.nftMedia) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let nftMedia = req.files.nftMedia;
            
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            nftMedia.mv('./uploads/' + nftMedia.name + nftMedia.md5 + path.extname(nftMedia.name));

            //send response
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: nftMedia.name,
                    mimetype: nftMedia.mimetype,
                    size: nftMedia.size
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }

    // try {
    //     res.send(JSON.stringify({
    //         'message': 'Success!'
    //       }))

    // } catch(e) {
    //     console.log(e);
    //     res.send(e)
    //     // [Error: Uh oh!]
           //res.status(500).send(err);
    // }



  
    // res.send(JSON.stringify({
    //  'nftMedia': nftMedia,
    //   'nftName': nftName,
    //   'nftDescription': nftDescription,
    //   'name1': name1,
    //   'value1': value1,
    //   'name2': name2,
    //   'value2': value2,
    //   'name3': name3,
    //   'value3': value3
    // }));

 });

app.listen(port, () => 
  console.log(`App is listening on port ${port}.`)
);






// -----------------------
// MINT NFT             //
// -----------------------


// const ApiPromise = require('@polkadot/api/promise');
// const WsProvider = require('@polkadot/api');
// var typesBundleForPolkadot = require('@crustio/type-definitions');


// console.log(ApiPromise);
// console.log(WsProvider);



// import {ApiPromise, WsProvider} from '@polkadot/api';
// import {typesBundleForPolkadot} from '@crustio/type-definitions';
// import { create } from 'ipfs-http-client';

// async function main() {
//   const api = new ApiPromise({
//     provider: new WsProvider('wss://api.crust.network'),
//     typesBundle: typesBundleForPolkadot,
//   });
//   await api.isReady;
//   console.log(123);
//   // Use api
// }

// main();