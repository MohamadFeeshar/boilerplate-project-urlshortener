'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dns = require('dns');
var UrlShorter = require('./models/urlShorter');

var cors = require('cors');

var app = express();


// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGO_URI,{ useMongoClient: true });


app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended:false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/api/shorturl/:num", function(req, res){
  var num = req.params.num;
  UrlShorter.findOne({"short_url":Number(num)}, function(err, urlShorter){
      if(err)
        console.log(err);
      else{
        res.redirect(301,"https://"+urlShorter.original_url);
      }
    }
  );
});
app.post("/api/shorturl/new", function(req, res, next){
    //capturing the url
    var url = req.body.url.toString();
    //removing http/https
    if(url.indexOf("https") !== -1){
      url = url.replace("https://", "");
    }
    else if(url.indexOf("http") !== -1){
      url = url.replace("http://", "");
    }
  
    //validating the url
    dns.lookup(url, function(err, address, family){
        if(err)
          res.json({"error":"invalid URL"});
        else{
          //checking if it already exists and returning it
          UrlShorter.findOne({"original_url":url}, function(err, urlShorter){
            if(err)  
              console.log(err);
            if(urlShorter === null){
              //checking the number of entries in the collection
              UrlShorter.find(function(err, data){
                urlShorter = new UrlShorter({original_url:url, short_url:data.length});
                //saving it to the db
                urlShorter.save(function(err, data){
                  if(err)
                    console.log(err);
                  else{
                    console.log("new entry saved: "+data);
                    //sending the json object with the original and short 
                    res.json({original_url:data.original_url, short_url:data.short_url});
                  }
                });
              });
            }
            else{
                res.json({original_url:urlShorter.original_url, short_url:urlShorter.short_url});
            }
          });
        }
    });
});


app.listen(port, function () {
  console.log('Node.js listening to port : '+port);
});