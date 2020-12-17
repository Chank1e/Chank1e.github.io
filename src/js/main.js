const blockMain = document.querySelector('.block_main')
const blockExtraWrapper = document.querySelector('.block_extra__wrapper')
const cityExtraTemplate = document.querySelector('#extra-city')
const cityMainTemplate = document.querySelector('#main-city')
const statsTemplate = document.querySelector('#stats-block')
const loaderTemplate = document.querySelector('#loader')
const btnAdd = document.querySelector('.js-add-btn')
const inputAdd = document.querySelector('.js-add-input')




function fillTemplate(template, values) {
    return template.replace(/{([^{}]*)}/g, function (a, b) {
        return values[b];
    });
}

function getCardinal(angle) {
    const degreePerDirection = 360 / 8;

    const offsetAngle = angle + degreePerDirection / 2;

    return (offsetAngle >= 0 && offsetAngle < degreePerDirection) ? "Север"
        : (offsetAngle >= degreePerDirection && offsetAngle < 2 * degreePerDirection) ? "Северо-Восток"
            : (offsetAngle >= 2 * degreePerDirection && offsetAngle < 3 * degreePerDirection) ? "Восток"
                : (offsetAngle >= 3 * degreePerDirection && offsetAngle < 4 * degreePerDirection) ? "Юго-Восток"
                    : (offsetAngle >= 4 * degreePerDirection && offsetAngle < 5 * degreePerDirection) ? "Юг"
                        : (offsetAngle >= 5 * degreePerDirection && offsetAngle < 6 * degreePerDirection) ? "Юго-Запад"
                            : (offsetAngle >= 6 * degreePerDirection && offsetAngle < 7 * degreePerDirection) ? "Запад"
                                : "Северо-Запад";
}

class Api {
    constructor() {
        this.endpoint = 'http://localhost:3000'
    }

    weatherByString(str) {
        return fetch(`${this.endpoint}/weather/city?q=${encodeURIComponent(str)}`).then(res => res.json())
    }

    weatherById(id) {
        return fetch(`${this.endpoint}/weather/city?id=${encodeURIComponent(id)}`).then(res => res.json())
    }

    weatherByLatLon({latitude, longitude}) {
        return fetch(`${this.endpoint}/weather/coordinates?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`).then(res => res.json())
    }

    saveFavorite(id) {
        return fetch(`${this.endpoint}/favorites`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id
            })
        }).then(res => res.json())
    }

    getFavorites() {
        return fetch(`${this.endpoint}/favorites`).then(res => res.json())
    }

    removeFavorite(id) {
        return fetch(`${this.endpoint}/favorites`, {
            method: "DELETE",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id
            })
        }).then(res => res.json())
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

let state = wrap(__state__)

let updateListeners = {}

const setState = newState => {
    state = newState
}

const getState = () => state

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
// function saveCityToLS(id) {
//     let data = JSON.parse(localStorage.getItem('cities') || '[]')
//     data.push(id)
//     localStorage.setItem('cities', JSON.stringify(data))
// }
//
// function removeCityFromLS(id) {
//     let data = JSON.parse(localStorage.getItem('cities') || '[]')
//     localStorage.setItem('cities', JSON.stringify(data.filter(_ => parseInt(_, 10) !== parseInt(id, 10))))
// }

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
    return loaderTemplate.innerHTML
}

function renderStats(stats) {
    if (!stats) return ''
    return stats.map(({title, value}) =>fillTemplate(statsTemplate.innerHTML, {title, value})).join('')
}

function renderBlockMain() {
    blockMain.innerHTML = ""
    const values = {
        loading: state.current.loading ? renderLoader() : '',
        title: state.current.title,
        temp: state.current.temp,
        stats: renderStats(state.current.params)
    }
    const node = cityMainTemplate.cloneNode(true)
    node.innerHTML = fillTemplate(node.innerHTML, values)
    const nodeImported = document.importNode(node.content, true)
    blockMain.appendChild(nodeImported)
    return blockMain.innerHTML
}

function renderBlocksExtra() {
    blockExtraWrapper.innerHTML = ""
    state.starred.forEach(loc => {
        const values = {
            loading: loc.loading ? renderLoader() : '',
            title: loc.title,
            temp: loc.temp,
            id: loc.id,
            stats: renderStats(loc.params)
        }
        const node = cityExtraTemplate.cloneNode(true)
        node.innerHTML = fillTemplate(node.innerHTML, values)
        const nodeImported = document.importNode(node.content, true)
        blockExtraWrapper.appendChild(nodeImported)
    });
    [...document.querySelectorAll('.city_extra__remove')].forEach(it => {
        it.addEventListener('click', () => {
            const id = it.getAttribute('data-id')
            if (!id) return
            onBtnRemoveClick(id)
        })
    })
    return blockExtraWrapper.innerHTML
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
    return state
}

async function loadFavorites() {
    const {list} = await api.getFavorites()
    state.starred = [...state.starred, ...list.map(_ => weatherMapper(_))]
    return state
}

/*END-INIT*/

/*HANDLERS*/
async function onBtnAddClick(e) {
    e.preventDefault()
    const val = inputAdd.value
    inputAdd.disabled = true
    inputAdd.value = 'Загрузка...'
    try {
        state.starred = [...state.starred, {loading: true}]
        const data = await api.weatherByString(val)
        if (data.cod === '404')
            throw new Error('not found')
        state.starred.pop()
        state.starred = [...state.starred]
        inputAdd.disabled = false
        inputAdd.value = ''
        if (state.starred.map(_ => _.id).includes(data.id)) return alert('Такой город уже есть!')
        await api.saveFavorite(data.id)
        state.starred = [...state.starred, weatherMapper(data)]
    } catch (err) {
        state.starred.pop()
        state.starred = [...state.starred]
        alert('Ошибочка(')
    }
    inputAdd.disabled = false
    inputAdd.value = ''
}

async function onBtnRemoveClick(id) {
    state.starred = state.starred.filter(_ => _.id !== parseInt(id, 10))
    await api.removeFavorite(id)
}

/*END-HANDLERS*/

async function mainFunc() {
    document.querySelector('#form').addEventListener('submit', onBtnAddClick)
    addListener('current', renderBlockMain)
    addListener('starred', renderBlocksExtra)
    initCurrentPosition()
    loadFavorites()
}

module.exports = {
    loadFavorites,
    initCurrentPosition,
    renderBlockMain,
    renderBlocksExtra,
    renderStats,
    renderLoader,
    weatherMapper,
    Api,
    getCardinal,
    fillTemplate,
    getCurrentPositionAsync,
    wrap,
    addListener,
    updateHandler,
    setState,
    param,
    state,
    getState,
    onBtnAddClick,
    onBtnRemoveClick,
}

