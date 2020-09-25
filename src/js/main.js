const apikey = 'd1b9e4aebf1311c3832b4a366dfe8604'

const blockMain = document.querySelector('.block_main')
const blockExtraWrapper = document.querySelector('.block_extra__wrapper')
const btnAdd = document.querySelector('.js-add-btn')
const inputAdd = document.querySelector('.js-add-input')

const fetchWeatherGet = (url) => fetch(`${url}&appid=${apikey}`).then(res => res.json())

function getCardinal(angle) {
    const degreePerDirection = 360 / 8;

    const offsetAngle = angle + degreePerDirection / 2;

    return (offsetAngle >= 0 * degreePerDirection && offsetAngle < 1 * degreePerDirection) ? "Север"
        : (offsetAngle >= 1 * degreePerDirection && offsetAngle < 2 * degreePerDirection) ? "Северо-Восток"
            : (offsetAngle >= 2 * degreePerDirection && offsetAngle < 3 * degreePerDirection) ? "Восток"
                : (offsetAngle >= 3 * degreePerDirection && offsetAngle < 4 * degreePerDirection) ? "Юго-Восток"
                    : (offsetAngle >= 4 * degreePerDirection && offsetAngle < 5 * degreePerDirection) ? "Юг"
                        : (offsetAngle >= 5 * degreePerDirection && offsetAngle < 6 * degreePerDirection) ? "Юго-Запад"
                            : (offsetAngle >= 6 * degreePerDirection && offsetAngle < 7 * degreePerDirection) ? "Запад"
                                : "Северо-Запад";
}

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

const getCurrentPositionAsync =
    () => new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true
    }))

const wrap = obj => {
    return new Proxy(obj, {
        get(target, propKey) {
            return target[propKey]
        },
        set(target, prop, value) {
            target[prop] = value
            updateHandler(prop)
        }
    })
}

let __state__ = {
    current: {
        loading: false,
        title: "",
        temp: 0,
        params: [
            {title: '', value: ''}
        ]
    },
    starred: []
}

const state = wrap(__state__)

let updateListeners = {}

function updateHandler(prop) {
    if (Array.isArray(updateListeners[prop]))
        updateListeners[prop].forEach(handler => handler())
}

function addListener(prop, handler) {
    if (Array.isArray(updateListeners[prop]))
        updateListeners[prop].push(handler)
    else
        updateListeners[prop] = [handler]
}

function param(title, value) {
    return {title, value}
}

const api = new Api()

/*LS*/
function saveCityToLS(id) {
    let data = JSON.parse(localStorage.getItem('cities') || '[]')
    data.push(id)
    localStorage.setItem('cities', JSON.stringify(data))
}

function removeCityFromLS(id) {
    let data = JSON.parse(localStorage.getItem('cities') || '[]')
    localStorage.setItem('cities', JSON.stringify(data.filter(_ => parseInt(_, 10) !== parseInt(id, 10))))
}

/*END-LS*/

/*MAPPERS*/
function weatherMapper(obj) {
    const {main, name, wind, coord, id} = obj

    return {
        id,
        title: name,
        temp: Math.round(main.temp),
        params: [
            param('Влажность', main.humidity + '%'),
            param('Давление', main.pressure + ' гПа'),
            param('Ветер м/с', wind.speed + ' м/с'),
            param('Ветер (направление)', getCardinal(wind.angle)),
            param('Координаты', Object.values(coord).join(',')),
        ],
    }
}

/*END-MAPPERS*/

/*RENDER*/
function renderLoader() {
    return `
        <div class="loader">
            <img src="./src/img/loader.gif">
        </div>`
}

function renderStats(stats) {
    if (!stats) return ''
    return stats.map(({title, value}) =>
        `<div class="stats_block">
            <div class="stats_block__title">${title}</div>
            <div class="stats_block__text">${value}</div>
        </div>
        `).join('')
}

function renderBlockMain() {
    blockMain.innerHTML = `
        ${state.current.loading ? renderLoader() : ''}
        <div class="block_main__left">
            <div class="city_full">
                <div class="city_full__title">
                    ${state.current.title}
                </div>
                <div class="city_full__flex">
                    <div class="city_full__icon"></div>
                    <div class="city_full__temperature">
                        ${state.current.temp}°
                    </div>
                </div>
            </div>
        </div>
        <div class="block_main__right">
            <div class="stats">
                ${renderStats(state.current.params)}
            </div>
        </div>`
}

function renderBlocksExtra() {
    const blocks = state.starred.map(loc => `
        <div class="block block_extra mt-1rem">
            ${loc.loading ? renderLoader() : ''}
            <div class="city_extra">
                <div class="city_extra__title">
                    ${loc.title}
                </div>
                <div class="city_extra__temperature">
                    ${loc.temp}°
                </div>
                <div class="city_extra__icon"></div>
                <div class="city_extra__remove"
                    data-id="${loc.id}"
                >
                    ✖
                </div>
            </div>
            <div class="stats">
                ${renderStats(loc.params)}
            </div>
            </div>
    `)
    blockExtraWrapper.innerHTML = blocks.join('');
    [...document.querySelectorAll('.city_extra__remove')].forEach(it => {
        it.addEventListener('click', () => {
            const id = it.getAttribute('data-id')
            if (!id) return
            onRemoveClick(id)
        })
    })
}

/*END-RENDER*/

/*INIT*/
async function initCurrentPosition() {
    state.current = {
        ...state.current,
        loading: true
    }
    let data = null
    try {
        const pos = await getCurrentPositionAsync()
        const {coords} = pos
        data = await api.weatherByLatLon({
            latitude: coords.latitude,
            longitude: coords.longitude
        })
    } catch (err) {
        const spbid = 498817
        data = await api.weatherById(spbid)
    }

    state.current = {
        ...state.current,
        ...weatherMapper(data),
        loading: false
    }
}

async function initFromLs() {
    const lsData = JSON.parse(localStorage.getItem('cities') || '[]')
    if (lsData.length === 0) return
    const {list} = await api.weatherByIds(lsData)
    state.starred = [...state.starred, ...list.map(_ => weatherMapper(_))]
}

/*END-INIT*/

/*HANDLERS*/
async function onBtnAddClick() {
    const val = inputAdd.value
    inputAdd.disabled = true
    inputAdd.value = 'Загрузка...'
    try {
        state.starred = [...state.starred, {loading: true}]
        const data = await api.weatherByString(val)
        state.starred.pop()
        if (state.starred.map(_ => _.id).includes(data.id)) return alert('Такой город уже есть!')
        saveCityToLS(data.id)
        state.starred = [...state.starred, weatherMapper(data)]
    } catch (err) {
        state.starred.pop()
        state.starred = [...state.starred]
        alert('Ошибочка(')
        console.error(err)
    }
    inputAdd.disabled = false
    inputAdd.value = ''
}

function onRemoveClick(id) {
    console.log(id)
    state.starred = state.starred.filter(_ => _.id !== parseInt(id, 10))
    removeCityFromLS(id)
}

/*END-HANDLERS*/

async function mainFunc() {
    btnAdd.addEventListener('click', onBtnAddClick)
    addListener('current', renderBlockMain)
    addListener('starred', renderBlocksExtra)
    initCurrentPosition()
    initFromLs()
}

mainFunc()
