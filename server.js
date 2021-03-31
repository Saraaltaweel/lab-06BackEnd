'use strict';


require('dotenv').config();
const superagent = require('superagent');
const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT ||4000;
const GEOCODE_API_KEY= process.env.GEOCODE_API_KEY;
const WEATHERS_API_KEY= process.env.WEATHERS_API_KEY;
const PARK_API_KEY= process.env.PARK_API_KEY;
const app = express();
app.use(cors());

app.get('/location', handelLocationRequest);
app.get('/weather', handelWeatherRequest);
app.get('/parks', handelParksRequest);

function handelLocationRequest(req, res) {

    const searchQuery = req.query.city;
    const url=`https://eu1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${searchQuery}&format=json`;

    if (!searchQuery){
        res.status(500).send('something is wrong in server');}

    superagent.get(url).then(item=>{
        const location = new Location(searchQuery,item.body[0]);
        res.send(location);
    })

  
  
    
}

function handelWeatherRequest(req, res) {
    const lat = req.query.latitude;
  const lon = req.query.longitude;
  const city=req.query.searchQuery;
    // const url = `https://api.weatherbit.io/v2.0/current?searchQuery=${city}&key=${WEATHERS_API_KEY}&include=minutely`;
    const url = `https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lon}&key=${WEATHERS_API_KEY}&include=minutely`;
    superagent.get(url).then(item=>{
        // console.log(item.body);
        const weatherData = item.body.data.map(item => {
            return new Weather(item);

      
       })
   res.send(weatherData);
   });

}


function Location(searchQuery,data) {
    this.search_query=searchQuery;
    this.formatted_query = data.display_name;
    this.latitude = data.lat;
    this.longitude = data.lon;
}
function Weather(data) {
    this.forecast = data.weather.description;
    this.time = data.datetime;
    
}
// const url = `https://developer.nps.gov/api/v1/alerts?q=${searchQuery3}&API_KEY=${PARK_API_KEY}`;
function handelParksRequest(req,res){
    const searchQuery3=req.query.searchQuery;
    const url = `https://developer.nps.gov/api/v1/parks?city=${searchQuery3}&api_key=${PARK_API_KEY}&limit=10`;

    superagent.get(url).then(item => {
        // console.log(item);
        const parkData = item.body.data.map(park => {
            return new Parks(park);
          });
          res.send(parkData);   
         });
       
      }
    
function Parks(data){
    this.name=data.fullName;
    this.address=Object.values(data.addresses[0]).join(',');
    this.fee=data.entranceFees[0].cost;
    this.description=data.description;
    this.park_url=data.url;
}

app.use('*', (req, res) => {
    res.send('all good nothing to see here!');
});

app.listen(PORT, () => console.log(`Listening to Port ${PORT}`));