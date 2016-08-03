/**
  HTTP UTILS
**/
var utils;

/*
 * Respond Redirect to HTTPS
 */
 utils.respondToHttps = function(req, res){

 }

/*
 * Respond Not Found
 */
utils.respondNotFound = function(req, res){
  res.status(404).send('Page Not Found');
  res.end();
}

module.exports = utils;
