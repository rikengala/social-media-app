const functions = require('firebase-functions');
const admin = require('firebase-admin');

const express = require('express');
const app = express();
admin.initializeApp();

var firebaseConfig = {
    apiKey: "AIzaSyB6oGsgiiMFGounchZC6vT0-ESuzbbnZmk",
    authDomain: "socialape-cdb0d.firebaseapp.com",
    databaseURL: "https://socialape-cdb0d.firebaseio.com",
    projectId: "socialape-cdb0d",
    storageBucket: "socialape-cdb0d.appspot.com",
    messagingSenderId: "673151044456",
    appId: "1:673151044456:web:e6965db9863159aa48a4dd"
  };

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const db = admin.firestore()

app.get('/screams', (req,res) =>{
    db.collection('screams').orderBy('createdAt','desc').get()
    .then(data =>{
        let screams = [];
        data.forEach(doc =>{
            screams.push({
                screamId : doc.id,
                body: doc.data().body,
                userHandle: doc.data().userHandle,
                createdAt:doc.data().createdAt
            });
        });
        return res.json(screams); 
    })
    .catch(err => console.log(err));
});

app.post('/scream',(request,response) =>{
    const newScream = {
        body: request.body.body,
        userHandle: request.body.userHandle,
        createdAt : new Date().toISOString()
    };

    db.collection('screams').add(newScream)
    .then((doc) => {
        return response.json({ message: `Document ${doc.id} created successfully`});
    })
    .catch(err => {
        console.log(err);
        return response.status(500).json({error: 'something with wrong'});
        
    })
});
const isEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(emailRegEx)) return true;
    else return false;
}
const isEmpty = (string) =>{
    if(string.trim() === '') return true;
    else return false;
}
//Sign Up Route
app.post('/signup',(req,res) =>{
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    }
    let errors = {};
    if(isEmpty(newUser.email)){
        errors.email = "Must not be empty";
    }
    else if(!isEmail(newUser.email)){
        errors.email = "Must be a valid email address";
    }
    if(isEmpty(newUser.password)){
        errors.password = "Must not be empty"
    }
    if(newUser.password !== newUser.confirmPassword){
        errors.confirmPassword = "Passwords must match";
    }
    if(isEmpty(newUser.handle)){
        errors.handle = "Must not be empty"
    }

    if(Object.keys(errors).length >0){
        return res.status(400).json(errors);
    }
    //TODO validate
    let token,userId;
    db.doc(`/users/${newUser.handle}`).
    get()
    .then(doc =>{
        if(doc.exists){
            return res.status(400).json({handle:'This handle is already taken'})
        }
        else{
            return firebase
            .auth()
            .createUserWithEmailAndPassword(newUser.email,newUser.password)
            .then(data =>{
                userId = data.user.uid;
                return data.user.getIdToken()
            })
            .then((idToken) =>{
                token = idToken;
                const userCredentials = {
                    handle: newUser.handle,
                    email:newUser.email,
                    createdAt: new Date().toISOString(),
                    userId
                };
                return db.doc(`/users/${newUser.handle}`).set(userCredentials)
            })
            .then(()=>{
                return res.status(201).json({ token })
            })
        }
    })
    .catch(err =>{
        console.log(err);
        if(err.code=== 'auth/email-already-in-use'){
            return res.status(400).json({email:'Email is already in use'});
        }
        else{
            return res.status(500).json({error:err.code});
        }
        
    })
});


exports.api = functions.region('asia-east2').https.onRequest(app);