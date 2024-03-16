const { ethers } = require('ethers');
const express = require('express');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

const app = express();
const port = 3100;

// Step 4: Connect to MongoDB
// const uri = 'mongodb://localhost:27017';
const uri = 'mongodb+srv://nehab:Tomnjerry@cluster0.c2g9sor.mongodb.net/Dapp?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect().then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

// Step 5: Define route to fetch data
app.get('/', async (req, res) => {
  try {
    const db = client.db('Dapp');
    const userCollection = db.collection('passengerdetails');
    const verifiedCollection = db.collection('passengerverified');
    const userCollection1 = db.collection('driverdetails');
    const verifiedCollection1 = db.collection('driververified');
    // Fetch users from MongoDB
    const users = await userCollection.find().toArray();

    // For each user, fetch data from IPFS
    for (const user of users) {
      try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(`https://ipfs.io/ipfs/${user.hashValue}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch data from IPFS: ${response.statusText}`);
        }
        const userData = await response.json();
        user.userData = userData; // Attach fetched user data to user object
      } catch (error) {
        console.error('Error fetching user data from IPFS:', error);
      }
    }


    const users1 = await userCollection1.find().toArray();

    // For each user, fetch data from IPFS
    for (const user1 of users1) {
      try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(`https://ipfs.io/ipfs/${user1.hashValue}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch data from IPFS: ${response.statusText}`);
        }
        const userData1 = await response.json();
        user1.userData1 = userData1; // Attach fetched user data to user object
      } catch (error) {
        console.error('Error fetching user data from IPFS:', error);
      }
    }
    // Fetch verified users from MongoDB
    const verifiedUsers = await verifiedCollection.find().toArray();
    const verifiedUsers1 = await verifiedCollection1.find().toArray();
    res.render('index', { users, verifiedUsers, users1, verifiedUsers1 });
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.set('view engine', 'ejs');
// const Web3 = require('web3');

// Initialize web3 with the provider
//const web3 = new Web3('HTTP://127.0.0.1:7545');
// const web3 = new Web3(window.ethereum);

// async function requestSignature(dataToSign) {
//     try {
//         const accounts = await web3.eth.requestAccounts();
//         const signature = await web3.eth.personal.sign(dataToSign, accounts[0]);
//         return signature;
//     } catch (error) {
//         console.error('Error requesting signature:', error);
//         throw error;
//     }
// }

// Step 3: Verify Signature
// function verifySignature(signature, dataToVerify, publicKey) {
//     const recoveredAddress = web3.eth.accounts.recover(dataToVerify, signature);
//     return recoveredAddress.toLowerCase() === publicKey.toLowerCase();
// }

// // Step 4: Perform Verification
// async function verifyUser() {
//   const dataToSign = 'Message to sign';
//   const signature = await requestSignature(dataToSign);
//   const isSignatureValid = verifySignature(signature, dataToSign, '0x464Dd50cbC25E0aa2CE2D6175De6dF69719D17D2');

// if (isSignatureValid) {
    // Proceed with verification

app.post('/verify/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    console.log('User ID:', userId); // Debug logging
    const db = client.db('Dapp');
    const userCollection = db.collection('passengerdetails');
    const verifiedCollection = db.collection('passengerverified');
    
    console.log('Trying to find user with ID:', userId); // Debug logging
    
    // Check if userId is a valid ObjectID
    if (!ObjectId.isValid(userId)) {
      return res.status(400).send('Invalid user ID');
    }

    const user = await userCollection.findOne({ _id: new ObjectId(userId) });

    console.log('Found user:', user); // Debug logging

    if (!user) {
      return res.status(404).send('User not found');
    }
    
    // Generate a 6-digit ID for the verified user
    const nanoid = (await import('nanoid')).nanoid;
    const newId = nanoid(6);
    
    // Update user object with new ID
    user.userId = newId;
    
    // Insert user into verified collection with new ID
    await verifiedCollection.insertOne(user);
    
    // Delete user from user collection
    await userCollection.deleteOne({ _id: new ObjectId(userId) });

    // Redirect to the same page
    res.redirect('/');
  } catch (err) {
    console.error('Error verifying user:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/verify1/:id', async (req, res) => {
  const userId1 = req.params.id;
  try {
    console.log('User ID:', userId1); // Debug logging
    const db = client.db('Dapp');
    const userCollection1 = db.collection('driverdetails');
    const verifiedCollection1 = db.collection('driververified');
    console.log('Trying to find user with ID:', userId1); // Debug logging
    
    // Check if userId is a valid ObjectID
    if (!ObjectId.isValid(userId1)) {
      return res.status(400).send('Invalid user ID');
    }

    const user1 = await userCollection1.findOne({ _id: new ObjectId(userId1) });

    console.log('Found user:', user1); // Debug logging

    if (!user1) {
      return res.status(404).send('User not found');
    }
    
    // Generate a 6-digit ID for the verified user
    const nanoid = (await import('nanoid')).nanoid;
    const newId1 = nanoid(6);
    
    // Update user object with new ID
    user1.userId1 = newId1;
    
    // Insert user into verified collection with new ID
    await verifiedCollection1.insertOne(user1);
    
    // Delete user from user collection
    await userCollection1.deleteOne({ _id: new ObjectId(userId1) });

    // Redirect to the same page
    res.redirect('/');
  } catch (err) {
    console.error('Error verifying user:', err);
    res.status(500).send('Internal Server Error');
  }
});
// } else {
//     console.error('Error verifying user:', err);
//     res.status(500).send('Internal Server Error');
//   }
// }
// const contractABI = [
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "string",
// 				"name": "_hashValue",
// 				"type": "string"
// 			},
// 			{
// 				"internalType": "string",
// 				"name": "_walletAddress",
// 				"type": "string"
// 			}
// 		],
// 		"name": "addUserDetails",
// 		"outputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": true,
// 				"internalType": "address",
// 				"name": "userAddress",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": false,
// 				"internalType": "string",
// 				"name": "hashValue",
// 				"type": "string"
// 			},
// 			{
// 				"indexed": false,
// 				"internalType": "string",
// 				"name": "walletAddress",
// 				"type": "string"
// 			}
// 		],
// 		"name": "UserAdded",
// 		"type": "event"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "",
// 				"type": "address"
// 			}
// 		],
// 		"name": "users",
// 		"outputs": [
// 			{
// 				"internalType": "string",
// 				"name": "hashValue",
// 				"type": "string"
// 			},
// 			{
// 				"internalType": "string",
// 				"name": "walletAddress",
// 				"type": "string"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	}
// ]/* ABI generated by Remix or compiler */;
// const contractAddress = '0xd9145CCE52D386f254917e481eB44e9943F39138'; // Address of the deployed smart contract

// const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
// const signer = provider.getSigner(); // Assuming the admin's private key is already configured

// const contract = new ethers.Contract(contractAddress, contractABI, signer);

// async function addUserDetails(hashValue, walletAddress) {
//     try {
//         const tx = await contract.addUserDetails(hashValue, walletAddress);
//         await tx.wait();
//         console.log('User details added successfully');
//     } catch (error) {
//         console.error('Error adding user details:', error);
//     }
// }

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
