var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var colors = require('colors');
var request = require('request');

mongoose.connect('mongodb://localhost/weather-today');

//Create the Schema for the weather.
var WeatherSchema = new mongoose.Schema({
  locations : String
});

//Create a mongoose model for the Weather Schema.
var Weather = mongoose.model('Weather', WeatherSchema);

//A way to turn strings into integers
var filterInt = function (value) {
  if(/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
    return Number(value);
  return NaN;
};

//Set the view engine to ejs.
app.set('view engine', 'ejs');
 
//Activate body parser and method override.
app.use(bodyParser.urlencoded({ extended : true }));
app.use(methodOverride('_method'));

//Gets the main page.
app.get('/', function(req,res){
  res.render('index');
});

//Saves the weather.
app.get('/weatherSaved', function(req,res){
  //Finds all of the weather.
  Weather.find({}, function(err,body){
    if(err){
      console.log(err);
    }else{

      body.forEach(function(local){

        //The main request to the API.
      var url = 'http://api.openweathermap.org/data/2.5/forecast/city?q=' + local.locations + '&units=imperial&APPID=6e98b8c45d7723192806d9b3b3814a04';

      request(url, function (error, response, lobby) {

        if (!error && response.statusCode == 200) {
          var parse = JSON.parse(lobby);
          //Gives you the name of the city.
              var cityName = parse.city.name;
         //Gives you the temperature of the city.
              var temperature = parse.list[0].main.temp;
          //Gives you the main type of forecast.
              var forecast = parse.list[0].weather[0].main;
          //Gives you the description of the forecast.
             var description = parse.list[0].weather[0].description;
          // Gives you the country of the location
              var country = parse.city.country;
  res.render('savedWeather', {cityName : cityName, temperature : temperature, forecast : forecast, description : description , country : country, location : body});
            }
// res.render('index', {cityName : cityName, temperature : temperature, forecast : forecast, description : description , country : country, location : body});
        });
      });
    }
  });
});
///////////////////////////////////////////////////////////////////////

/// All of the logic for searching the weather with the API. //

app.get('/weathersearch', function(req,res){

//Getting the city from the URL.
  var city = req.query.cityQuery;
//Checking to see if the string zip code that we searched up is a number.
if(typeof(city[0]) === "1" || "2" || "3" || "4" || "5" || "6" || "7" || "8" || "9" || "10"  ){

  //Turn the zip code that we searched into a number.
//  var newCity = filterInt(city);

  var url = 'http://api.openweathermap.org/data/2.5/forecast/city?zip=' + city + '&units=imperial&APPID=6e98b8c45d7723192806d9b3b3814a04';

  request(url, function (error, response, body) {

    if (!error && response.statusCode == 200) {
      var parse = JSON.parse(body);
      //Gives you the name of the city.
          var cityName = parse.city.name;
     //Gives you the temperature of the city.
          var temperature = parse.list[0].main.temp;
      //Gives you the main type of forecast.
          var forecast = parse.list[0].weather[0].main;
      //Gives you the description of the forecast.
         var description = parse.list[0].weather[0].description;
      // Gives you the country of the location
          var country = parse.city.country;

          res.render('weather', {cityName : cityName, temperature : temperature, forecast : forecast, description : description , country : country, id : city});
      //    });
    }

       });

}else{
  var url = 'http://api.openweathermap.org/data/2.5/forecast/city?q=' + city + '&units=imperial&APPID=6e98b8c45d7723192806d9b3b3814a04';

  request(url, function (error, response, body) {

    if (!error && response.statusCode == 200) {
      var parse = JSON.parse(body);
      //Gives you the name of the city.
          var cityName = parse.city.name;
     //Gives you the temperature of the city.
          var temperature = parse.list[0].main.temp;
      //Gives you the main type of forecast.
          var forecast = parse.list[0].weather[0].main;
      //Gives you the description of the forecast.
         var description = parse.list[0].weather[0].description;
      // Gives you the country of the location
          var country = parse.city.country;

  res.render('weather', {cityName : cityName, temperature : temperature, forecast : forecast, description : description , country : country, id : city });

          }

      });

    }
});
///////////////////////////////////////////////////////////////////////

app.get('/saveWeather/:id', function(req,res){


//Gets the Location from the URL.
var location = req.params.id;

//Add the location to the database.
var locator = Weather({
  locations : location
});
  //Save the location to the database.
  locator.save(function(err,body){
    if(err){
      console.log(err);
    }else{
      res.redirect('/weatherSaved');
    }
  });

});

//Below me is how to remove the contents of the application.
app.get('/remove', function(req,res){
  Weather.remove({},function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect('/');
    }
  });
});


app.listen('3000', function(){
  console.log('========================='.blue);
  console.log(' Listening on Port 3000'.green);
  console.log('========================='.blue);
});
