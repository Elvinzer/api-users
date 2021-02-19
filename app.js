const express = require('express');
const bodyParser = require('body-parser');

// Credentials AWS
var AWS = require('aws-sdk');
var users;
let awsConfig = {
    "region": "us-east-2",
    "endpoint": "dynamodb.us-east-2.amazonaws.com",
    "accessKeyId": "AKIAJFAJEK7J6F7Z6G2A", "secretAccessKey" : "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"
};
AWS.config.update(awsConfig)

// Section requete dynamoDB
let docClient = new AWS.DynamoDB.DocumentClient();

// Récupération de tous les users sur dynamodb
let fetchAll = function () {
  var params = {
      TableName: "users"
  };
  docClient.scan(params, function(err, data){
      if (err){
          console.log("users:fetchAll::error - " + JSON.stringify(err, null, 2));
      }
      else{
          console.log("users:fetchAll::success - " + JSON.stringify(data, null, 2));
          users = data
      }
  })
}
// Suppression d'un user sur dynamodb
let removeOneByKey = function (req) {
    var params = {
        TableName: "users",
        Key:{
            "users_id": req[0].users_id,
        },
        ConditionExpression:"lastname = :lastname AND firstname = :firstname AND birthdayDate = :birthdayDate",
        ExpressionAttributeValues: {
            ":lastname": req[0].lastname.toLowerCase(),
            ":firstname": req[0].firstname.toLowerCase(),
            ":birthdayDate": req[0].birthdayDate,
        }
    };
    docClient.delete(params, function(err, data) {
        if (err) {
            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
        }
    });
  }
// Création d'un user sur dynamodb
let addOneByKey = function (req) {
    var params = {
        TableName: "users",
        Item:{
            "users_id": Date.now().toString(),
            "lastname": req[0].lastname.toLowerCase(),
            "firstname" : req[0].firstname.toLowerCase(),
            "birthdayDate": req[0].birthdayDate,
        }
    };
    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to create item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Creation succeeded:", JSON.stringify(data, null, 2));
        }
    });
  }
// Modification d'un user sur dynamodb
let updateOneByKey = function (req) {
    var params = {
        TableName: "users",
        Key:{
            "users_id": req[0].users_id,
        },
        UpdateExpression: "set lastname = :lastname, firstname=:firstname, birthdayDate=:birthdayDate",
        ExpressionAttributeValues:{
            ":lastname": req[0].lastname.toLowerCase(),
            ":firstname": req[0].firstname.toLowerCase(),
            ":birthdayDate": req[0].birthdayDate
        },
        ReturnValues:"UPDATED_NEW"
    };
    docClient.update(params, function(err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Update succeeded:", JSON.stringify(data, null, 2));
        }
    });
}

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.post('/users/add', (req, res, next) => {
    addOneByKey(req.body.user)
    res.status(201).json({
        message : 'User bien ajouté'
    })
    next();
})

app.post('/users/remove', (req, res, next) => {
    removeOneByKey(req.body.user);
    res.status(200).json({
        message : 'User bien supprimé'
    })
    next();
})

app.post('/users/update', (req, res, next) => {
    //console.log(req.body.user)
    updateOneByKey(req.body.user, req.body.users_id);
    res.status(200).json({
        message : 'User bien updated'
    })
    next();
})

  app.use('/users/all', (req, res, next) => {
    fetchAll();
    res.status(200).json({
        users
    })
    
    next();
  })

  app.use('/', (req, res, next) => {
    res.status(200).json({
        message : 'accueil'
    })
  })


module.exports = app;