const express = require('express'),
    app = express(),
    http = require('http'),
    https = require('https'),
    server = http.createServer(app),
    port = process.env.PORT || 4000;

const myKey = ''; 
// url to current weather stats
const proxy = `https://api.openweathermap.org/data/2.5/weather?`;
// url to 5 day forecast weather stats
const proxyForecast = "https://api.openweathermap.org/data/2.5/forecast?";
app.use(express.static('./public'));
app.use(express.json());

app.get('/', (req, res)=>{
    res.render('index.html');
});

app.get('/weather/:city/:state', (req, res)=>{

    console.log('path /weather : ', req.params);
    // fetch weather stats for city, state
    fetchWeather(res, req.params.city, req.params.state);
});

app.get('/forecast/:city/:state', (req, res)=>{
    console.log('server will proxy for forecast, ', req.params);

    // fetch icon
    fetchForecast(res, req.params.city, req.params.state);
});

// fetches icon image from openweather api
async function fetchForecast(res, city, state){
    console.log('making request to openweather for weeks forecast ');
    //get request at proxyForecast
    let append = `q=${city},%20${state}%20%&appid=${myKey}`;
    https.get(proxyForecast + append, (response)=>{

        let data = '';
        // while listening for response
        response.on('data', (chunk)=>{
            data += chunk;
        });

        // finished listening for response
        response.on('end', ()=>{
            let returner = JSON.parse(data);
            console.log('finished retrieving data: ', returner.list);
            // temp response from server
            res.status(200).json(returner.list);
        });

    }).on('error', (err)=>{
        console.log('error trying to retrieve image: ', err);
        // bad response from openweather api
        res.status(500).send({message: 'bad request'});

    });
}

// fetches weather states from openweather api
async function fetchWeather(res, city, state){
    let append = `q=${city},%20${state}%20%&appid=${myKey}`;
    try{
        // make proxy request to openweather api through https
        https.get(proxy+append, (response)=>{
            let data = '';
            // append data responses from openweather api
            response.on('data',(chunk)=>{
                data += chunk;
            });

            // on finalized response res request
            response.on('end', ()=>{
                let returner = JSON.parse(data);
                //console.log('finished request ', returner);
                res.status(200).json(returner);
                
            });
            
        }).on('error', (err)=>{
            console.log('rrrr: ',err);
            res.status(500).send({message:'error fetching weather'});
        });
        
        // catch if error occurs and res request with bad server request
    }catch (err) {
        console.log('iiiii: ', err);
        res.status(500).send({message:'error fetching weather'});
    }


}

server.listen(port, ()=>{

    console.log('server listening on : ', port);
});
