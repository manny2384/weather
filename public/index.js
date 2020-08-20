let city = 'San Luis Obispo'; 
let state = 'CA';
let URL = `http://localhost:4000`;
let imgUrl = "http://openweathermap.org/img/wn/";

const stateList = ['AL', 'AK', 'AZ', 'AR','CA', 'CO','CT','DE','FL','GA','HI',
'ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE',
'NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN',
'TX','UT','VT','VA','WA','WV','WI','WY'];

const options = {
    method: 'GET',
    headers: {
        'Content-Type':'application/json',
    },
    resolvewithfullresponse : true
};


window.onload = () =>{
    // button to initiate fetch
    searchBtn = document.getElementById('search-btn');
    // callback function for search btn fetches city
    searchBtn.addEventListener('click', fetchCity);

    // append to option list of id state, all 50 state abbreviations
    let stateSelection = document.getElementById('state');
    stateList.map((item)=>{
        let newOp = document.createElement('option');
        let stateName = document.createTextNode(item);
        newOp.appendChild(stateName);
        stateSelection.appendChild(newOp);
    });

    // fetches city from open weather api
    async function fetchCity(){
 
        // extract and reset input fields
        city = document.getElementById('name').value;
        document.getElementById('name').value = '';
        state = document.getElementById('state').value;
        document.getElementById('state').value = '';
        console.log('need to fetch : ', city, ', ', state);
        // checks if no input from city or state
        city = city.trim();
        if(city === '' || state === ''){
            alert('need to indicate state or city');
            return;
        }
        


        // attempt to fetch api with user input values
        try{
            let response = await fetching();
            console.log(' response: ', response);
            // shows stats of the day
            console.log(' stats of the day: ', response.main);
            // add elements to display section of weather
            let finished = await addElements(response);

            // if finished setting weather display -> display section
            if(finished){
                console.log(' all done setting section display');
                document.getElementsByClassName('weather-display')[0].style.display = 'grid';
                document.getElementsByClassName('stats-of-day')[0].style.display = 'grid';
                document.getElementsByClassName('forecast')[0].style.display = 'block';
            }

            // retrieve the forecast for upcoming days
            let five_day = await fetchForecast();
            
            // split five_day into five days at hour 3pm; j = index of upcoming five days
            for(let i=0, j=0; i*8<five_day.length; ++i){
                // daily forecast
                // upcoming days forecast
                    
                let noon = (1+i)*8-4;// noon hour
                let id_index = j + 1;
                let humidId = document.getElementById('humidity'+id_index);
                let day_ = document.getElementById('day'+id_index);
                let time_ = document.getElementById('time'+id_index);
                let min_temp = document.getElementById('min_temp'+id_index);
                let max_temp = document.getElementById('max_temp'+id_index);
                let describe_ = document.getElementById('describe'+id_index);
                   
                // split date / time 
                let date_time = five_day[noon].dt_txt;
                date_time = date_time.split(' ');
                document.getElementById('img'+id_index).src = imgUrl + five_day[noon].weather[0]["icon"] + ".png";
                describe_.innerHTML = `Description: ${five_day[noon].weather[0]["description"]}`
                humidId.innerHTML = `Humidity: ${five_day[noon].main.humidity} %`;
                day_.innerHTML = `Date: ${date_time[0]}`;
                time_.innerHTML = `Time: ${date_time[1]}`;
                min_temp.innerHTML = ` Min Temp: ${kel_to_far(five_day[noon].main.temp_min).toFixed(2)} &#8457;`;
                max_temp.innerHTML = `Max Temp: ${kel_to_far(five_day[noon].main.temp_max).toFixed(2)} &#8457;`;
                
                j++; // increment index by one to following day
              
            }

            //console.log('temp response from fetchImg ', icon);
        }catch (e) {
            console.log(' error in catch block fetching : ', e);
            
        }


    }

    //fetches forecast for upcoming days of city
    function fetchForecast() {
        console.log("fetching forecast ");
        return new Promise((resolve, reject)=>{
            fetch('/forecast'+'/'+city+'/'+state, options).then((response)=>{
                
                return response.json();
            }).then((data)=>{
                console.log("temp response from server on front: ", data);
                resolve(data);// resolve promise
            }).catch((err)=>{
                console.log('error response from server while trying to fetch icon \n', err);
                reject(err);// reject promise
            });
        })
    }

    // fetches stats on weather for location,
    // returns json object from api
    function fetching(){

        return new Promise((resolve, reject) => {
            fetch('/weather'+'/'+city+'/'+state, options)
            .then((response)=>{
                console.log('response from fetch: \n', response);

                return response.json();
            }).then((data)=>{
                console.log('data: ', data);
                resolve(data);
            }).catch((err)=>{
                console.log(' error in fetching function ', err);
                reject(false);

            });
        });
    }

    // params: day is the json obj of location weather description
    // adds description elements to weather-display section
    function addElements(day){
        console.log("Adding day: ", day);
        var d = new Date();
        return new Promise((resolve,reject)=>{
            try{
                document.getElementsByClassName('weather-display')[0].style.backgroundImage = imgUrl + day.weather[0]["icon"] + ".png";
                // add image icon and descriptions to main block
                console.log(' fetch for this icon: ', day.weather[0].icon);
                document.getElementById('weather-img').src = imgUrl + day.weather[0].icon + ".png";
                
                document.getElementById('cityName').innerHTML = `${city.toUpperCase()}, ${state}`;
                document.getElementById('currentTime').innerHTML = `${d}`;
                document.getElementById('dayType').innerHTML = `Description: ${day.weather[0].description}`;
                // sets temperature
                document.getElementById('degrees').innerHTML = `${kel_to_far(day.main.temp).toFixed(2)} &#8457;`;
                document.getElementById('feel').innerHTML = `Actual Feel: ${kel_to_far(day.main.feels_like).toFixed(2)} &#8457;`;
                
                // adds values to stats of day block
                document.getElementById('max_temp').innerHTML = `Max Temp : ${kel_to_far(day.main.temp_max).toFixed(2)} &#8457;`;
                document.getElementById('min_temp').innerHTML = `Min Temp : ${kel_to_far(day.main.temp_min).toFixed(2)} &#8457;`;
                document.getElementById('humidity').innerHTML = `Humidity : ${day.main.humidity} %`;
                document.getElementById('pressure').innerHTML = `Pressure : ${day.main.pressure} hPa atm`;
                document.getElementById('wind').innerHTML = `Wind Speed : ${day.wind.speed} m/s`;

                resolve(true);
            }catch(err){
                console.log('error setting weather display ', err);
                reject(false);
            }       
        });
    }

    // convert kelvin to fahrenheit
    let kel_to_far = (kel) => {
        let returner = (9/5) * (kel - 273.15);
        return (returner+32);
    }
}