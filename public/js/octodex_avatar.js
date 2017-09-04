
var request = require('request');
var cheerio = require('cheerio');

function generateAvatar(cb){
  const url = 'https://octodex.github.com';
  var arr =[];
  request(url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);
        $('.item a').each(function (index, value){
          listing = $(this).first().children().attr('data-src');
          if (listing !== undefined){
          var final= url+listing;
          arr.push(final);
          }
        });
        function getRandomInt(min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }
          result = arr[getRandomInt(0,arr.length)];
          // console.log(result)
          cb(result);
      }else{
        return "no avatar generated";
      }
    })
  };

module.exports.generateAvatar = generateAvatar;
