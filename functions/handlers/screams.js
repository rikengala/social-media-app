const { db } = require('../util/admin');

exports.getAllScreams = (req,res) =>{
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
}

exports.postOneScream = (request,response) => {

    if(request.body.body.trim() === ''){
        return res.status(400).json({body: 'Body must not be empty'});
    }
    else{
        const newScream = {
            body: request.body.body,
            userHandle: request.user.handle,
            createdAt : new Date().toISOString()
        };
    
        db.collection('screams').add(newScream)
        .then((doc) => {
            return response.json({ message: `Document ${doc.id} created successfully`});
        })
        .catch(err => {
            console.log(err);
            return response.status(500).json({error: 'something with wrong'});
        });
    }
    
}
