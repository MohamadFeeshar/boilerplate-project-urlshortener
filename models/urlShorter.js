var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var urlShorterschema = new Schema({
  original_url:{type:String, required:true},
  short_url:Number
});

var UrlShorter = mongoose.model('UrlShorter', urlShorterschema);

module.exports = UrlShorter;