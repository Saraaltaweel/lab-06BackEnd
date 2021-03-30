'use strict';


require('dotenv').config();
const superagent = require('superagent');
const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT ||3000;
const GEOCODE_API_KEY= process.env.GEOCODE_API_KEY;
const WEATHERS_API_KEY= process.env.WEATHERS_API_KEY;
const PARK_API_KEY= process.env.PARK_API_KEY;
const app = express();
app.use(cors());

app.get('/location', handelLocationRequest);
app.get('/weather', handelWeatherRequest);
// app.get('/parks', handelParksRequest);

function handelLocationRequest(req, res) {

    const searchQuery = req.query.city;
    const url=`https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${searchQuery}&format=json`;

    if (!searchQuery){
        res.status(500).send('something is wrong in server');}

    superagent.get(url).then(item=>{
        const location = new Location(searchQuery,item.body[0])
        res.send(location);
    })

  
  
    
}

function handelWeatherRequest(req, res) {
    const searchQuery = req.query.city;
    const url = `http://api.weatherbit.io/v2.0/forecast/daily?KEY=${WEATHERS_API_KEY}&city=${searchQuery}&country=US`;
  
    superagent.get(url).then(item=>{
        console.log(item.body);

    })

    weatherRawData.data.forEach(weather => {
        weatherData.push(new Weather(weather));
    });

    res.send(weatherData);

}


function Location(searchQuery,data) {
    this.searchQuery=searchQuery;
    this.formatted_query = data.display_name;
    this.latitude = data.lat;
    this.longitude = data.lon;
}
function Weather(data) {
    this.description = data.weather.description;
    this.valid_date = data.valid_date;
    
}


app.use('*', (req, res) => {
    res.send('all good nothing to see here!');
});

app.listen(PORT, () => console.log(`Listening to Port ${PORT}`));