const client = require('../src/js/main')
const trimify = str => str.replace(/\s+/g, "")

const defaultState = () => ({
  current: {
    loading: false,
    title: "",
    temp: 0,
    params: [
      {title: '', value: ''}
    ]
  },
  starred: []
})

const weatherObject = () => ({
  main: {
    humidity: 1,
    pressure: 10,

  },
  name: "Rogachev",
  temp: 1,
  wind: {
    speed: 100,
    angle: 180,
  },
  coord: {
    latitude: 10,
    longitude: 20
  },
  id: 10
})

function mockFetchWithResponse(response) {
  return () => new Promise(
    resolve => resolve({json: () => new Promise(res2 => res2(response))})
  )
}

describe("Position functionality", () => {
  describe("getCardinal()", () => {

    it("should return 'Юг' for 180", () => {
      expect(client.getCardinal(180)).toBe("Юг")
    })

    it("should return 'Север' for 10", () => {
      expect(client.getCardinal(10)).toBe("Север")
    })

    it("should return 'Северо-Запад' for 360", () => {
      expect(client.getCardinal(360)).toBe("Северо-Запад")
    })

    it("should return 'Восток' for 75", () => {
      expect(client.getCardinal(75)).toBe("Восток")
    })

  })
  describe('getCurrentPositionAsync()', () => {
    it('should return correct values on resolve', async () => {
      const currentPosition = await client.getCurrentPositionAsync()
      expect(currentPosition.coords).toHaveProperty('latitude');
      expect(currentPosition.coords).toHaveProperty('longitude');
      expect(currentPosition.coords).toEqual({
        latitude: '12',
        longitude: '23',
      });
    });
  });
})


describe("State functionality", () => {

  describe("addListener()", () => {

    it("addListener to current should work if current changes", () => {
      const state = client.wrap(defaultState())
      const handler = jest.fn()
      client.addListener("current", handler)
      state.current = "testvalue"
      expect(handler).toBeCalled()
    })

    it("addListener to starred should work if starred changes", () => {
      const state = client.wrap(defaultState())
      const handler = jest.fn()
      client.addListener("starred", handler)
      state.starred = "testvalue2"
      expect(handler).toBeCalled()
    })

    it("addListener to starred should not work if current changes", () => {
      const state = client.wrap(defaultState())
      const handler = jest.fn()
      client.addListener("starred", handler)
      state.current = "testvalue2"
      expect(handler).not.toBeCalled()
    })

  })

})

describe("Render functionality", () => {
  describe("renderLoader()", () => {
    it("should return correct loader", () => {
      const data = client.renderLoader()
      expect(data).toBe(global.document.querySelector('#loader').innerHTML)
    })
  })
  describe("renderStats()", () => {
    it("should return empty string if no stats provided", () => {
      const data = client.renderStats()
      expect(data).toHaveLength(0)
    })
    it("should return correct html if stats provided", () => {
      const data = client.renderStats([{
        title: 1,
        value: 2
      }])
      expect(trimify(data)).toBe(trimify(`
        <li class="stats_block">
          <div class="stats_block__title">1</div>
          <div class="stats_block__text">2</div>
        </li>
      `))
    })
  })
  describe("renderBlockMain()", () => {
    it("should return default HTML if state is not changed", () => {
      const data = client.renderBlockMain()
      expect(trimify(data)).toBe(trimify(`
        <div class="block_main__left">
            <div class="city_full">
                <h2 class="city_full__title">
                    
                </h2>
                <div class="city_full__flex">
                    <div class="city_full__icon"></div>
                    <div class="city_full__temperature">
                        0°
                    </div>
                </div>
            </div>
        </div>
        <div class="block_main__right">
            <ul class="stats">
                
        <li class="stats_block">
            <div class="stats_block__title"></div>
            <div class="stats_block__text"></div>
        </li>
    
            </ul>
        </div>
      `))
    })
    it("should return temperature HTML if state temperature is 5", () => {
      const state = client.wrap(defaultState())
      state.current.temp = 5
      client.setState(state)
      const data = client.renderBlockMain()
      expect(trimify(data)).toBe(trimify(`
        <div class="block_main__left">
            <div class="city_full">
                <h2 class="city_full__title">
                    
                </h2>
                <div class="city_full__flex">
                    <div class="city_full__icon"></div>
                    <div class="city_full__temperature">
                        5°
                    </div>
                </div>
            </div>
        </div>
        <div class="block_main__right">
            <ul class="stats">
                
        <li class="stats_block">
            <div class="stats_block__title"></div>
            <div class="stats_block__text"></div>
        </li>
    
            </ul>
        </div>
      `))
    })
  })
  describe("renderBlocksExtra()", () => {
    it("should return default HTML if state is not changed", () => {
      const data = client.renderBlocksExtra()
      expect(data).toHaveLength(0)
    })
    it("should return default HTML if state is not changed", () => {
      const weather = client.weatherMapper(weatherObject())
      client.setState({
        ...defaultState(),
        starred: [weather]
      })
      const data = client.renderBlocksExtra()
      expect(trimify(data)).toBe(trimify(`
        <li class="block block_extra mt-1rem">
          <div class="city_extra">
              <h3 class="city_extra__title">
                  Rogachev
              </h3>
              <div class="city_extra__temperature">
                  NaN°
              </div>
              <div class="city_extra__icon"></div>
              <button class="city_extra__remove" data-id="10">
                  ✖
              </button>
          </div>
          <ul class="stats"> 
            <li class="stats_block">
                <div class="stats_block__title">Влажность</div>
                <div class="stats_block__text">1%</div>
            </li>
            <li class="stats_block">
                <div class="stats_block__title">Давление</div>
                <div class="stats_block__text">10 гПа</div>
            </li>
            <li class="stats_block">
                <div class="stats_block__title">Ветер м/с</div>
                <div class="stats_block__text">100 м/с</div>
            </li>
            <li class="stats_block">
                <div class="stats_block__title">Ветер (направление)</div>
                <div class="stats_block__text">Юг</div>
            </li>
            <li class="stats_block">
                <div class="stats_block__title">Координаты</div>
                <div class="stats_block__text">10,20</div>
            </li>
          </ul>
        </li>
      `))
    })
  })
})


describe("Simple tests", () => {
  describe("param()", () => {
    it("should return object", () => {
      const data = client.param("1", 2)
      expect(data).toBeInstanceOf(Object)
    })
    it("should return correct object", () => {
      const data = client.param("1", "123")
      expect(data).toHaveProperty("title", "1")
      expect(data).toHaveProperty("value", "123")
    })
  })
  describe("weatherMapper()", () => {
    it("should return object", () => {
      const data = client.weatherMapper(weatherObject())
      expect(data).toBeInstanceOf(Object)
    })
    it("should return object with valid keys", () => {
      const data = client.weatherMapper(weatherObject())
      expect(data).toHaveProperty("id")
      expect(data).toHaveProperty("title")
      expect(data).toHaveProperty("temp")
      expect(data).toHaveProperty("params")
    })
  })
  describe("fillTemplate()", () => {
    it("should return valid HTML", () => {
      const template = `<div>{title}</div>`
      const filled = client.fillTemplate(template, {title: 1})
      expect(filled).toBe(`<div>1</div>`)
    })
  })
  describe("initCurrentPosition()", () => {
    it("should return correct state if position provided(try block)", async () => {
      global.fetch = mockFetchWithResponse({
        "coord": {"lon": 23, "lat": 12},
        "weather": [{"id": 800, "main": "Clear", "description": "clear sky", "icon": "01d"}],
        "base": "stations",
        "main": {
          "temp": 33.85,
          "feels_like": 28.95,
          "temp_min": 33.85,
          "temp_max": 33.85,
          "pressure": 1009,
          "humidity": 10,
          "sea_level": 1009,
          "grnd_level": 939
        },
        "visibility": 10000,
        "wind": {"speed": 3.77, "deg": 113},
        "clouds": {"all": 0},
        "dt": 1608205162,
        "sys": {"country": "SD", "sunrise": 1608180099, "sunset": 1608221215},
        "timezone": 7200,
        "id": 7754689,
        "name": "Godosgo",
        "cod": 200
      })
      const data = await client.initCurrentPosition()
      expect(data.current).toHaveProperty("loading", false)
      expect(data.current).toHaveProperty("title", "Godosgo")
    })
    it("should return correct state for saint-peterburg if no position provided(catch block)", async () => {
      global.fetch = mockFetchWithResponse({
        "coord": {"lon": 30.26, "lat": 59.89},
        "weather": [{"id": 804, "main": "Clouds", "description": "overcast clouds", "icon": "04d"}],
        "base": "stations",
        "main": {"temp": 1.23, "feels_like": -5.08, "temp_min": 1, "temp_max": 1.67, "pressure": 1018, "humidity": 86},
        "visibility": 10000,
        "wind": {"speed": 6, "deg": 300},
        "clouds": {"all": 90},
        "dt": 1608205728,
        "sys": {"type": 1, "id": 8926, "country": "RU", "sunrise": 1608188241, "sunset": 1608209587},
        "timezone": 10800,
        "id": 498817,
        "name": "Saint Petersburg",
        "cod": 200
      })
      global["navigator"] = {
        geolocation: {
          getCurrentPosition: (res, rej, opts) => rej(),
        }
      }
      const data = await client.initCurrentPosition()
      expect(data.current).toHaveProperty("loading", false)
      expect(data.current).toHaveProperty("title", "Saint Petersburg")
    })
  })
  describe("loadFavorites", () => {
    beforeEach(() => {
      client.setState(defaultState())
    })
    it("should return state with empty favorites", async () => {
      global.fetch = mockFetchWithResponse({"cnt": 0, "list": []})
      await client.loadFavorites()
      const state = client.getState()
      expect(state.starred).toHaveLength(0)
    })
    it("should return state with 2 favorites", async () => {
      global.fetch = mockFetchWithResponse({
        "cnt": 2,
        "list": [{
          "coord": {"lon": 37.62, "lat": 55.75},
          "sys": {"country": "RU", "timezone": 10800, "sunrise": 1608184508, "sunset": 1608209786},
          "weather": [{"id": 500, "main": "Rain", "description": "light rain", "icon": "10d"}],
          "main": {
            "temp": 1.97,
            "feels_like": -3.37,
            "temp_min": 1.67,
            "temp_max": 2.22,
            "pressure": 1018,
            "humidity": 93
          },
          "visibility": 10000,
          "wind": {"speed": 5, "deg": 260},
          "clouds": {"all": 75},
          "dt": 1608203220,
          "id": 524901,
          "name": "Moscow"
        }, {
          "coord": {"lon": -0.13, "lat": 51.51},
          "sys": {"country": "GB", "timezone": 0, "sunrise": 1608192099, "sunset": 1608220321},
          "weather": [{"id": 800, "main": "Clear", "description": "clear sky", "icon": "01d"}],
          "main": {
            "temp": 9.55,
            "feels_like": 5.31,
            "temp_min": 7.78,
            "temp_max": 10.56,
            "pressure": 1015,
            "humidity": 76
          },
          "visibility": 10000,
          "wind": {"speed": 4.6, "deg": 240},
          "clouds": {"all": 0},
          "dt": 1608203376,
          "id": 2643743,
          "name": "London"
        }]
      })
      await client.loadFavorites()
      const state = client.getState()
      expect(state.starred).toHaveLength(2)
    })
  })
})

const $api = new client.Api()
describe("Api()", () => {
  beforeAll(() => {
    global.fetch = (url, options) => new Promise(
      resolve => resolve({json: () => new Promise(res2 => res2({url, options}))})
    )
  })
  it("should have endpoint http://localhost:3000", () => {
    expect($api).toHaveProperty("endpoint", "http://localhost:3000")
  })
  it("should return weather by string", async () => {
    const city = "moscow"
    const {url} = await $api.weatherByString(city)
    expect(url).toBe(`http://localhost:3000/weather/city?q=${city}`)
  })
  it("should return weather by id", async () => {
    const id = 123456
    const {url} = await $api.weatherById(id)
    expect(url).toBe(`http://localhost:3000/weather/city?id=${id}`)
  })
  it("should return weather by lat/lon", async () => {
    const obj = {latitude: 1, longitude: 2}
    const {url} = await $api.weatherByLatLon(obj)
    expect(url).toBe(`http://localhost:3000/weather/coordinates?lat=${obj.latitude}&lon=${obj.longitude}`)
  })
  it("should save favorite", async () => {
    const id = 123456
    const {url, options} = await $api.saveFavorite(id)
    expect(url).toBe(`http://localhost:3000/favorites`)
    expect(options).toHaveProperty('method', 'POST')
    expect(options).toHaveProperty('headers')
    expect(options.headers).toHaveProperty('Accept', 'application/json')
    expect(options.headers).toHaveProperty('Content-Type', 'application/json')
    expect(options).toHaveProperty('body', JSON.stringify({id}))
  })
  it("should get favorites", async () => {
    const {url} = await $api.getFavorites()
    expect(url).toBe(`http://localhost:3000/favorites`)
  })
  it("should remove favorite", async () => {
    const id = 123456
    const {url, options} = await $api.removeFavorite(id)
    expect(url).toBe(`http://localhost:3000/favorites`)
    expect(options).toHaveProperty('method', 'DELETE')
    expect(options).toHaveProperty('headers')
    expect(options.headers).toHaveProperty('Accept', 'application/json')
    expect(options.headers).toHaveProperty('Content-Type', 'application/json')
    expect(options).toHaveProperty('body', JSON.stringify({id}))
  })
})

describe("BTN clicks", () => {
  describe("onBtnAddClick()", () => {
    it("should preventDefault", () => {
      const prevent = jest.fn()
      client.onBtnAddClick({preventDefault: prevent})
      expect(prevent).toBeCalledTimes(1)
    })
    it("should not change state if response is 404", () => {
      global.fetch = mockFetchWithResponse({cod: "404"})
      const stateBeforeClick = client.getState()
      client.onBtnAddClick({preventDefault: jest.fn()})
      expect(stateBeforeClick).toBe(client.getState())
    })
  })
  describe("onBtnRemoveClick()", () => {
    it("should remove starred", () => {
      client.setState({...defaultState(), starred: [{id: 1}]})
      expect(client.getState().starred).toHaveLength(1)
      global.fetch = mockFetchWithResponse({})
      client.onBtnRemoveClick(1)
      expect(client.getState().starred).toHaveLength(0)
    })
  })
})
