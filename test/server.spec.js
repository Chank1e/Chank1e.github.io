const server = require("../server/app");
const request = require("supertest");

const $api  = new server.Api()
describe("Api()", () => {
  it("should have endpoint https://api.openweathermap.org/data/2.5", () => {
    expect($api).toHaveProperty("endpoint", "https://api.openweathermap.org/data/2.5")
  })
  it("should return weather by string", async () => {
    const city = "moscow"
    const {data} = await $api.weatherByString(city)
    expect(data.name).toBe("Moscow")
    expect(data.cod).toBe(200)
    expect(data.id).toBe(524901)
  })
  it("should return weather by id", async () => {
    const id = 524901
    const {data} = await $api.weatherById(id)
    expect(data.name).toBe("Moscow")
    expect(data.cod).toBe(200)
    expect(data.id).toBe(id)
  })
  it("should return weather by ids", async () => {
    const ids = [524901,2643743]
    const {data} = await $api.weatherByIds(ids)
    expect(data).toHaveProperty("cnt",2)
    expect(data.list).toHaveLength(2)
    expect(data.list.some(_=>_.name === "London")).toBeTruthy()
    expect(data.list.some(_=>_.name === "Moscow")).toBeTruthy()
  })
  it("should return weather by lat/lon", async () => {
    const latlon = {latitude: 55.751244, longitude:37.618423}
    const {data} = await $api.weatherByLatLon(latlon)
    expect(data.name).toBe("Moscow")
    expect(data.cod).toBe(200)
    expect(data.id).toBe(524901)
  })
})

describe("express.app()", () => {
  it("should pong on /ping", () => {
    return request(server.app)
      .get('/ping')
      .then(response => {
        expect(response.statusCode).toBe(200)
        expect(response.text).toBe("PONG")
      })
  })
  describe("/weather", () => {
    it("should return spb city for id 498817", () => {
      return request(server.app)
        .get('/weather/city?id=498817')
        .then(response => {
          expect(response.statusCode).toBe(200)
          expect(response.body.name).toBe("Saint Petersburg")
        })
    })
    it("should return spb city for query Saint Petersburg", () => {
      return request(server.app)
        .get(`/weather/city?q=${encodeURIComponent('Saint Petersburg')}`)
        .then(response => {
          expect(response.statusCode).toBe(200)
          expect(response.body.name).toBe("Saint Petersburg")
          expect(response.body.id).toBe(498817)
        })
    })
    it("should return moscow city lat/lon", () => {
      return request(server.app)
        .get(`/weather/coordinates?lat=${encodeURIComponent(55.75)}&lon=${encodeURIComponent(37.62)}`)
        .then(response => {
          expect(response.statusCode).toBe(200)
          expect(response.body.name).toBe("Moscow")
          expect(response.body.id).toBe(524901)
        })
    })
  })
  describe("/favorites", () => {
    it("should save and return favorites", async () => {
      const NY_ID = 5128581
      const $s = request(server.app)
      const responseInitialList = await $s.get("/favorites")
      expect(responseInitialList.status).toBe(200)

      const initialLength = responseInitialList.body.list.length
      const responsePost = await $s.post("/favorites").send({id:NY_ID})
      expect(responsePost.status).toBe(200)
      expect(responsePost.body).toHaveProperty("msg", "success")

      const responseCompleteList = await $s.get("/favorites")
      const completeLength = responseCompleteList.body.list.length
      expect(responseCompleteList.status).toBe(200)
      expect(initialLength + 1).toBe(completeLength)

    })
    it("should save and delete favorites", async () => {
      const BOSTON_ID = 4930956
      const $s = request(server.app)
      const responseInitialList = await $s.get("/favorites")
      expect(responseInitialList.status).toBe(200)

      const initialLength = responseInitialList.body.list.length
      const responsePost = await $s.post("/favorites").send({id:BOSTON_ID})
      expect(responsePost.status).toBe(200)
      expect(responsePost.body).toHaveProperty("msg", "success")

      const responseCompleteList = await $s.get("/favorites")
      const completeLength = responseCompleteList.body.list.length
      expect(responseCompleteList.status).toBe(200)
      expect(initialLength + 1).toBe(completeLength)

      const responseDelete = await $s.delete("/favorites").send({id:BOSTON_ID})
      expect(responsePost.status).toBe(200)
      expect(responsePost.body).toHaveProperty("msg", "success")

      const responseAfterDelete = await $s.get("/favorites")
      const afterDeleteLength = responseAfterDelete.body.list.length
      expect(responseAfterDelete.status).toBe(200)
      expect(initialLength).toBe(afterDeleteLength)
    })
  })

})

