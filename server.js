'use strict';


require('dotenv').config();
const superagent = require('superagent');
const pg = require('pg');
const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT ||3000;
const ENV = process.env.ENV || 'DEB';
const DATABASE_URL=process.env.DATABASE_URL;
const GEOCODE_API_KEY= process.env.GEOCODE_API_KEY;
const WEATHERS_API_KEY= process.env.WEATHERS_API_KEY;
const PARK_API_KEY= process.env.PARK_API_KEY;
const MOVIES_API_KEY= process.env.MOVIES_API_KEY;
const YELP_API_KEY= process.env.YELP_API_KEY;

const app = express();
app.use(cors());

app.get('/location', handelLocationRequest);
app.get('/weather', handelWeatherRequest);
app.get('/parks', handelParksRequest);
app.get('/movies', handelMovieRequest);
app.get('/yelp', handelYelpRequest);

// const client = new pg.Client(process.env.DATABASE_URL);
let client ='';
if(ENV==='DIV'){
  client = new pg.Client({connectionString: DATABASE_URL})
}else{client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: {rejectUnauthorized: false}
    })}


function handelLocationRequest(req, res) {

    const searchQuery = req.query.city;
    const city=[searchQuery];
    let select=`SELECT * FROM locations WHERE search_query=$1;`
    const url=`https://eu1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${searchQuery}&format=json`;

    if (!searchQuery){
        res.status(500).send('something is wrong in server');}
   
        client.query(select,city).then(result=>{
         if(result.rows.length>0){
            res.send(result.rows[0])
           
            console.log(result.rows)
         }
         
        
       
        
        else{
            superagent.get(url).then(item=>{
                const location = new Location(searchQuery,item.body[0]);
                const SQL = 'INSERT INTO locations (search_query, formatted_query,latitude,longitude) VALUES($1, $2, $3, $4);';
        
                let values=[searchQuery,location.formatted_query,location.latitude,location.longitude];
                client.query(SQL,values).then(item=>{
                    console.log(item.rows)
                })
                res.send(location);

            })
            .catch(() => {
                res.status(404).send("your search not found");
              });

                
                    // return{
                    //   search_query: searchQuery,
                    //   formatted_query: data.display_name,
                    //   latitude: data.lat,
                    //   longitude: data.lon
                    // }
            
        }  
              
               
            
    
       
        console.log(result.rows);
    

    })
}


//     superagent.get(url).then(item=>{
//         const location = item.body.map(data=>{
//             return{
//               search_query: searchQuery,
//               formatted_query: data.display_name,
//               latitude: data.lat,
//               longitude: data.lon
//             }
//           });
//         const SQL = 'INSERT INTO locations (search_query, formatted_query,latitude,longitude) VALUES($1, $2, $3, $4) RETURNING *';

//         let values=[searchQuery,location.search_query,location.latitude,location.longitude];
//         client.query(SQL,values).then(item=>{
//             console.log(item.rows)
//         })
       
//         res.send(location);
//     })

  

// }   


  
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

function handelMovieRequest(req,res){
    const searchQuery4=req.query.searchQuery;
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${MOVIES_API_KEY}&query=${searchQuery4}`;

    superagent.get(url).then(item => {
        // console.log(item);
        const movieData = item.body.results.map(movie => {
            return new Movie(movie);
          });
          res.send(movieData);   
         });
       
      }

function Movie(data){
    this.title=data.title;
    this.overview=data.overview;
    this.average_votes=data.average_votes;
    this.total_votes=data.total_votes;
    this.image_url=`https://image.tmdb.org/t/p/w500${data.poster_path}`;

    this.popularity=data.popularity;
    this.released_on=data.released_on;


}

function handelYelpRequest(req,res){
    const searchQuery5=req.query.searchQuery;
    const url = `https://api.yelp.com/v3/businesses/search?location=${searchQuery5}&limit=50`;

    superagent.get(url).set('Authorization', `Bearer ${YELP_API_KEY}`).then(item => {
        // console.log(item);
        const yelpData = item.body.businesses.map(yelp => {
            return new Yelp(yelp);
          });
          res.send(yelpData);   
         });
       
      }

      
  function Yelp(data){
    this.name=data.name;
    this.image_url=data.image_url;
    this.price=data.price;
    this.rating=data.rating;
    this.url=data.url;

}


app.use('*', (req, res) => {
    res.send('all good nothing to see here!');
});

client.connect().then(()=>{

    app.listen(PORT, () => console.log(`App is running on Server on port: ${PORT}`));
  })
