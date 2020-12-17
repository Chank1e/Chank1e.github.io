const PORT = 3000
const apikey = 'd1b9e4aebf1311c3832b4a366dfe8604'

const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const bodyParser = require("body-parser");
const cors = require('cors');
const morgan = require('morgan');

const app = express();

const weatherRouter = express.Router();
const favoritesRouter = express.Router();
mongoose.connect('mongodb://localhost:27017/web2020', {useNewUrlParser: true, useUnifiedTopology: true});

const Favorite = mongoose.model('Favorite', {openWeatherId: Number});

const fetchWeatherGet = async (url) => axios.get(`${url}&appid=${apikey}`)

class Api {
  constructor() {
    this.endpoint = 'https://api.openweathermap.org/data/2.5'
  }

  weatherByString(str) {
    return fetchWeatherGet(`${this.endpoint}/weather?q=${encodeURIComponent(str)}&units=metric`)
  }

  weatherById(id) {
    return fetchWeatherGet(`${this.endpoint}/weather?id=${encodeURIComponent(id)}&units=metric`)
  }

  weatherByIds(ids) {
    return fetchWeatherGet(`${this.endpoint}/group?id=${encodeURIComponent(ids.join(','))}&units=metric`)
  }

  weatherByLatLon({latitude, longitude}) {
    return fetchWeatherGet(`${this.endpoint}/weather?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&units=metric`)
  }
}

const $api = new Api();

app.use(cors());
app.use(bodyParser.json());
app.use(morgan('short'))

app.get('/ping', (req, res) => {
  res.send('PONG')
})

weatherRouter.get('/city', async (req, res) => {
  const {query} = req;
  const {q, id} = query;
  try {
    if (q) {
      const {data} = await $api.weatherByString(q);
      return res.json(data);
    } else {
      const {data} = await $api.weatherById(id);
      return res.json(data);
    }
  } catch (err) {
    res.status(err.response.status || 500).json({
      ...err.response.data
    });
  }


})

weatherRouter.get('/coordinates', async (req, res) => {
  const {query} = req;
  const {lat, lon} = query;
  try {
    const {data} = await $api.weatherByLatLon({
      latitude: lat,
      longitude: lon
    });
    return res.json(data);
  } catch (err) {
    res.status(err.response.status || 500).json({
      ...err.response.data
    });
  }
})


favoritesRouter.get('/', async (req, res) => {
  const items = await Favorite.find({})
  if (items.length === 0) return res.json([])
  try {
    const {data} = await $api.weatherByIds(items.map(({openWeatherId}) => openWeatherId));
    return res.json(data);
  } catch (err) {
    res.status(err.response.status || 500).json({
      ...err.response.data
    });
  }
})

favoritesRouter.post('/', async (req, res) => {
  const {body} = req;
  const {id} = body;
  const favorite = new Favorite({
    openWeatherId: parseInt(id, 10)
  })
  try {
    await favorite.save();
    return res.json({
      msg: 'success'
    })
  } catch (err) {
    res.status(err.response.status || 500).json({
      ...err.response.data
    });
  }
})

favoritesRouter.delete('/', async (req, res) => {
  const {body} = req;
  const {id} = body;
  try {
    await Favorite.deleteOne({
      openWeatherId: id
    });
    return res.json({
      msg: 'success'
    })
  } catch (err) {
    res.status(err.response.status || 500).json({
      ...err.response.data
    });
  }
})


app.use('/weather', weatherRouter)
app.use('/favorites', favoritesRouter)

if (process.env.IS_TESTING !== "true")
  app.listen(PORT, () => {
    console.log(`listening on ${PORT}`)
  })

module.exports = {
  Api,
  fetchWeatherGet
}
