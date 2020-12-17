const server = require("../server/server");


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
