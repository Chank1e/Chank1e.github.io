const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = `
<!doctype html>
<div class="wrapper">
    <header class="header">
        <h1 class="header__title">Погода здесь</h1>
        <button class="header__refresh">
        </button>
    </header>
    <main>
        <section class="block block_main mt-1rem">
            <div class="block_main__left">
                <div class="city_full">
                    <h3 class="city_full__title">
                        Санкт-Петербург
                    </h3>
                    <div class="city_full__flex">
                        <div class="city_full__icon"></div>
                        <div class="city_full__temperature">
                            +78°
                        </div>
                    </div>
                </div>
            </div>
            <div class="block_main__right">
                <ul class="stats">
                    <li class="stats_block">
                        <div class="stats_block__title">Ветер</div>
                        <div class="stats_block__text">Трам-пам</div>
                    </li>
                    <li class="stats_block">
                        <div class="stats_block__title">Облачность</div>
                        <div class="stats_block__text">Трам-пам</div>
                    </li>
                    <li class="stats_block">
                        <div class="stats_block__title">Давление</div>
                        <div class="stats_block__text">Трам-пам</div>
                    </li>
                    <li class="stats_block">
                        <div class="stats_block__title">Влажность</div>
                        <div class="stats_block__text">Трам-пам</div>
                    </li>
                    <li class="stats_block">
                        <div class="stats_block__title">Координаты</div>
                        <div class="stats_block__text">Трам-пам</div>
                    </li>
                </ul>
            </div>
        </section>
        <div class="input_main mt-1rem">
            <h2 class="input_main__title">
                Избранное
            </h2>
            <form class="input_main__form" id="form">
                <div class="input_main__form-input mr-1rem-desktop">
                    <input type="text" placeholder="Добавить новый город" class="js-add-input">
                </div>
                <button class="input_main__form-btn js-add-btn">
                    +
                </button>
            </form>
        </div>
        <ul class="block_extra__wrapper">
        </ul>
    </main>
</div>
<template id="extra-city">
    <li class="block block_extra mt-1rem">
        {loading}
        <div class="city_extra">
            <h3 class="city_extra__title">
                {title}
            </h3>
            <div class="city_extra__temperature">
                {temp}°
            </div>
            <div class="city_extra__icon"></div>
            <button class="city_extra__remove"
                    data-id="{id}"
            >
                ✖
            </button>
        </div>
        <ul class="stats">
            {stats}
        </ul>
    </li>
</template>

<template id="loader">
    <div class="loader">
        <img src="./src/img/loader.gif">
    </div>
</template>

<template id="stats-block">
    <li class="stats_block">
        <div class="stats_block__title">{title}</div>
        <div class="stats_block__text">{value}</div>
    </li>
</template>

<template id="main-city">
    {loading}
    <div class="block_main__left">
        <div class="city_full">
            <h2 class="city_full__title">
                {title}
            </h2>
            <div class="city_full__flex">
                <div class="city_full__icon"></div>
                <div class="city_full__temperature">
                    {temp}°
                </div>
            </div>
        </div>
    </div>
    <div class="block_main__right">
        <ul class="stats">
            {stats}
        </ul>
    </div>
</template>
`

const dom = new JSDOM(html)
// global.document = dom.window.document
// global.window = dom.window
const window = dom.window
const document = window.document
module.exports = { window, document, html }
