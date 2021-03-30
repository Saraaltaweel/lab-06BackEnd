'use strict';


require('dotenv').config();

const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT ||3000;
const app = express();
app.use(cors());

app.get('/location', handelLocationRequest);
app.get('/weather', handelWeatherRequest);

function handelLocationRequest(req, res) {

    const searchQuery = req.query.city;
  if (!searchQuery){
    res.status(500).send('something is wrong in server');}
  
  
    const locationsRawData = require('./data/location.json');
    const location = new Location(locationsRawData[0])
    res.send(location);
}

function handelWeatherRequest(req, res) {
    const weatherRawData = require('./data/weather.json');
    const weatherData = [];

    weatherRawData.data.forEach(weather => {
        weatherData.push(new Weather(weather));
    });

    res.send(weatherData);

}


function Location(data) {
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