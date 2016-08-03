/**
  HTTP UTILS
**/
var utils;

/**
  REQUEST PARSING
**/

  /*
   * getSource
   * removes port suffix to get target host
   */
   utils.getSource = function(req){
     if (req.headers.host){
       return req.headers.host.split(':')[0];
     }
   }

   /*
    * parseURLParams
    * splits URL into components to determine the best route
    */
   utils.parseURLParams = function(url){
     return url.split('/');
   }

/**
 RESPONSES
**/

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
