#!/usr/bin/env node
const Web3 = require('web3');
const {createCanvas, loadImage} = require('canvas')
Canvas = require('canvas');
const fs = require('fs');
const express = require("express");


const app = express();
let port = process.env.PORT || 3000;

let blocknum = fs.readFile('block.txt', 'utf-8', function (err, data) {
  console.log("Got data back from file", data)
});

app.listen(port, () => {
  console.log("Example app is listening on port http://localhost:" + port)
})

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next()
});

app.use(express.static("public"));


let options = {
  timeout: 30000, // ms

  // Useful for credentialed urls, e.g: ws://username:password@localhost:8546
  headers: {
    authorization: 'Basic username:password'
  },

  clientConfig: {
    // Useful if requests are large
    maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
    maxReceivedMessageSize: 100000000, // bytes - default: 8MiB

    // Useful to keep a connection alive
    keepalive: true,
    keepaliveInterval: 60000 // ms
  },

  // Enable auto reconnection
  reconnect: {
    auto: true,
    delay: 5000, // ms
    maxAttempts: 5,
    onTimeout: false
  }
};

let web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ws.s0.pops.one/', options));


const abi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "x",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "y",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "soldPrice",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes3",
        "name": "color",
        "type": "bytes3"
      }
    ],
    "name": "PixelChanged",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "NumberPixelChanged",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "basePrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "x",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "y",
        "type": "uint256[]"
      },
      {
        "internalType": "bytes3[]",
        "name": "color",
        "type": "bytes3[]"
      }
    ],
    "name": "colorMultiplePixel",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "x",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "y",
        "type": "uint256"
      },
      {
        "internalType": "bytes3",
        "name": "color",
        "type": "bytes3"
      }
    ],
    "name": "colorPixel",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "pixels",
    "outputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "soldPrice",
        "type": "uint256"
      },
      {
        "internalType": "bytes3",
        "name": "color",
        "type": "bytes3"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "users",
    "outputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "totalPixels",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "currentPixels",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdraw",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const address = '0x7a1f208DD13E43cD974ABAFB0B8a1BACfa009f81';

const contract = new web3.eth.Contract(abi, address);


const canvas = createCanvas(1000, 1000)
const ctx = canvas.getContext('2d')


loadImage('./canvas.png').then(image => {
  ctx.drawImage(image, 0, 0)

  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync('./test.png', buffer)


  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  console.log(imageData)


  let data = imageData.data;
  console.log(canvas.width, canvas.height, data.length);

  function writePixelWithEvent(event) {
    let {x, y, color} = event.returnValues;
    writePixel(
      parseInt(x),
      parseInt(y),
      parseColor(color)
    );
  }

  function parseColor(rawColor) {
    let rgb = [];
    for (let i = 0; i < rawColor.length; i += 2) {
      let chunk = rawColor.substring(i, i + 2);
      if (chunk !== '0x') {
        rgb.push(parseInt(chunk, 16).toString(10));
      }
    }
    return rgb;
  }

  function writePixel(x, y, color) {
    //console.log(x, y, color);

    // grab the existing image data
    let data = imageData.data;

    // notice that canvas is in scope here
    let columns = canvas.width;
    let rows = canvas.height;

    // Now, finding the index is a little tricky, because the image data is a
    // one-dimensional array.
    //
    // How do we find the index in a one-dimensional array? First we'll take the
    // y-value times the number of columns plus the x value, times 4. Why four?
    // Because we have one byte per channel per pixel.
    //
    // If that seems confusing, try to work it out on paper, but honestly
    // understanding the layout of this image array it's not that crucial to building
    // this app. This _is_ how you find the index.

    let i = (y * columns + x) * 4;

    // Now we will assign the pixel in data each channel of our pixel in color.
    data[i] = color[0];
    data[i + 1] = color[1];
    data[i + 2] = color[2];

    // I want every pixel to be opaque, that is, no transparency, so I'll set the
    // alpha channel to 255. If you don't do this, your pixels will be invisible.
    data[i + 3] = 255; // alpha

    // And lastly, we put the image data back into the canvas.
    // You might see this and realize that we're rewriting the canvas on every pixel.
    // You could certainly batch these updates, but we're not going to, just for
    // simplicity.
    ctx.putImageData(imageData, 0, 0);
    let dataurl = canvas.toDataURL('image/png');


    fs.writeFile("./public/dataURL.txt", dataurl, (err) => {
      if (err)
        console.log(err);
      else {
        console.log("File written successfully\n");
      }
    });
  }

  let nb = 0;
  contract.getPastEvents(
    'PixelChanged',
    {
      fromBlock: 14352635
    },
    function (error, events) {

      //console.log('event : ', events);
      if (events !== undefined) {
        events.map(e => writePixelWithEvent(e));
        nb++;
        console.log(nb)
      }
    }
  );

  contract.events.PixelChanged(
    {
      fromBlock: 14352635
    },
    function (error, event) {
      //console.log('new event : ', event);
      console.log(error);
      if (event !== undefined || event !== null) {
        writePixelWithEvent(event);
        nb++;
        console.log(nb)
      }

    }
  );
})

process.on('SIGTERM', () => {
  console.info('Received SIGTERM');
  web3.eth.getBlockNumber().then(console.log);
  web3.eth.getBlockNumber().then(blocknumber => {
    fs.writeFile('./block.txt', blocknumber.toString(), function (err) {
      if (err) return console.info(err);
      console.info("Block number written")
    });
  })
  /*fs.readFile("./public/dataURL.txt", "utf-8", function (error, data) {
    fs.writeFile("canvas.png", data.substr(data.indexOf(',') + 1), "base64", function(err) {
      console.info(err);
      console.info("Canvas written");
    });
    if (error) {
        throw error;
    }
  });*/
  process.exit(0);
});

