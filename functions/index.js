const functions = require('firebase-functions');
const express = require('express');
const app = express();

const { getAllScreams, postOneScream } = require('./handlers/screams')
const { signup , login } = require('./handlers/users');
const { FBAuth } = require('./util/fbAuth')

//Scream Routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth , postOneScream);

//User routes

//Sign Up Route
app.post('/signup',signup);
//Login route
app.post('/login',login)


exports.api = functions.region('asia-east2').https.onRequest(app);