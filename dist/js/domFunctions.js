"use strict";

export const setPlaceholderText = () => {
    const input = document.getElementById("searchBar__text");
    window.innerWidth < 400 ? input.placeholder = "City, State, Country" : input.placeholder = "City, State, Country, or Zip Code";
};

export const addSpinner = (element) => {
    animateButton(element);
    setTimeout(animateButton, 1000, element);
};

const animateButton = (element) => {
    element.classList.toggle("none");
    element.nextElementSibling.classList.toggle("block");
    element.nextElementSibling.classList.toggle("none");
};

export const displayError = (headerMsg, srMsg) => {
    updateWeatherLocationHeader(headerMsg, srMsg);
    updateScreeReaderCnfirmation(srMsg);
};

export const displayApiError = (statusCode) => {
    const properMsg = toProperCase(statusCode.message);
    updateWeatherLocationHeader(properMsg);
    updateScreeReaderCnfirmation(`${properMsg}. Please try again.`);
};

const toProperCase = (text) => {
    const words = text.split(" ");
    const properWords = words.map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return properWords.join(" ");
};

const updateWeatherLocationHeader = (message) => {
    const h1 = document.querySelector(".currentForecast__location");
    if (message.indexOf("Lat:") !== -1 && message.indexOf("Long:") !== -1) {
        const msArray = message.split(" ");
        const mapArray = msArray.map(msg => {
            return msg.replace(":", ": ");
        });
        const lat = mapArray[0].indexOf("-") === -1 ? mapArray[0].slice(0, 10) : mapArray[0].slice(0, 11);
        const lon = mapArray[1].indexOf("-") === -1 ? mapArray[1].slice(0, 11) : mapArray[1].slice(0, 12);
        h1.textContent = `${lat} • ${lon}`;
    } else {
        h1.textContent = message;
    }
    
};

export const updateScreeReaderCnfirmation = (message) => {
    document.querySelector("#confirmation").textContent = message;
};

export const updateDisplay = (weatherJson, locationObj) => {
    fadeDisplay();
    clearDisplay();
    const weatherClass = getWeatherClass(weatherJson.current.weather[0].icon);
    setBgImage(weatherClass);
    const screenReaderWeather = buildScreeReaderWeather(weatherJson, locationObj);
    updateScreeReaderCnfirmation(screenReaderWeather);
    updateWeatherLocationHeader(locationObj.getName());
    //current conditions 
    const ccArray = createCurrentConditionsDivs(weatherJson, locationObj.getUnit());
    displayCurrentConditions(ccArray);
    //six days forecast
    displaySixDayForecast(weatherJson);
    setFocusOnSearch();
    fadeDisplay();
};

const fadeDisplay = () => {
    const cc = document.getElementById("currentForecast");
    cc.classList.toggle('zero-vis');
    cc.classList.toggle('fade-in');
    const sixDays = document.getElementById("dailyForecast");
    sixDays.classList.toggle('zero-vis');
    sixDays.classList.toggle('fade-in');
};

const clearDisplay = () => {
    const currentConditions = document.getElementById("currentForecast__conditions");
    deleteContents(currentConditions);
    const sixDayForecast = document.getElementById("dailyForecast__contents");
    deleteContents(sixDayForecast);
};

const deleteContents = (parentElement) => {
    let child = parentElement.lastElementChild;
    while (child) {
      parentElement.removeChild(child);
      child = parentElement.lastElementChild;
    }
  };

const getWeatherClass = (icon) => {
    const firstTwoChars = icon.slice(0, 2);
    const lastChar = icon.slice(2);
    const weatherLookUp = {
        "09": "snow",
        10: "rain",
        11: "rain",
        13: "snow",
        50: "fog",
    };
    let weatherClass;
    if (weatherLookUp[firstTwoChars]) {
        weatherClass = weatherLookUp[firstTwoChars];
    } else if (lastChar == "d") {
        weatherClass = "clouds";
    } else {
        weatherClass = "night";
    }
    return weatherClass;
};

const setBgImage = (weatherClass) => {
    document.documentElement.classList.add(weatherClass);
    document.documentElement.classList.forEach(img => {
        if (img !== weatherClass) document.documentElement.classList.remove(img);
    });
};

const buildScreeReaderWeather = (weatherJson, locationObj) => {
    const location = locationObj.getName();
    const unit = locationObj.getUnit();
    const tempUnit = unit === "imperial" ? "Fahrenheit" : "Celsius";
    return `${weatherJson.current.weather[0].description} and ${Math.round(Number(weatherJson.current.temp))}°${tempUnit} in ${location}`;
};

const setFocusOnSearch = () => {
    document.getElementById("searchBar__text").focus();
};

const createCurrentConditionsDivs = (weatherObj, unit) => {
    const tempUnit = unit === "imperial" ? "F" : "C";
    const windUnit = unit === "imperial" ? "mph" : "m/s";

    const icon = createMainImgDiv(weatherObj.current.weather[0].icon, weatherObj.current.weather[0].description);
    const temp = createElem("div", "temp", `${Math.round(Number(weatherObj.current.temp))}°`);
    const properDesc = toProperCase(weatherObj.current.weather[0].description);
    const desc = createElem("div", "desc", properDesc);
    const feels = createElem("div", "feels", `Feels like${Math.round(Number(weatherObj.current.feels_like))}°`);
    const maxTemp = createElem("div", "maxtemp", `High ${Math.round(Number(weatherObj.daily[0].temp.max))}°`);
    const minTemp = createElem("div", "mintemp", `Low ${Math.round(Number(weatherObj.daily[0].temp.min))}°`);
    const humidity = createElem("div", "humidity", `Humidity ${weatherObj.current.humidity}%`);
    const wind = createElem("div", "wind", `Wind ${Math.round(Number(weatherObj.current.wind_speed))} ${windUnit}`);
    return [icon, temp, desc, feels, maxTemp, minTemp, humidity, wind];
};

const createMainImgDiv = (icon, altText) => {
    const iconDiv = createElem("div", "icon");
    iconDiv.id = "icon";
    const faIcon = translateIconToFontAwesome(icon);
    faIcon.ariaHidden = true;
    faIcon.title = altText;
    iconDiv.appendChild(faIcon);
    return iconDiv;
};

const createElem = (elemType, divClassName, divText, unit) => {
    const div = document.createElement(elemType);
    div.className = divClassName;
    if (divText) {
        div.textContent = divText;
    }
    if (div.className == "temp") {
        const unitDiv = document.createElement("div");
        unitDiv.className = "unit";
        unitDiv.textContent = unit;
        div.appendChild(unitDiv);
    }
    return div;
};

const translateIconToFontAwesome = (icon) => {
    const i = document.createElement("i");
    const firstTwoChars = icon.slice(0, 2);
    const lastChar = icon.slice(2);
    switch (firstTwoChars) {
        case "01":
            if (lastChar == "d") {
                i.classList.add("far", "fa-sun");
            } else {
                i.classList.add("far", "fa-moon");
            }
            break;
        case "02":
            if (lastChar == "d") {
                i.classList.add("fas", "fa-cloud-sun");
            } else {
                i.classList.add("fas", "fa-cloud-moon");
            }
            break;
        case "03":
            i.classList.add("fas", "fa-cloud");
            break;
        case "04":
            i.classList.add("fas", "fa-cloud-meatball");
            break;
        case "09":
            i.classList.add("fas", "fa-cloud-rain");
            break;
        case "10":
            if (lastChar == "d") {
                i.classList.add("fas", "fa-cloud-sun-rain");
            } else {
                i.classList.add("fas", "fa-cloud-moon-rain");
            }
            break;
        case "11":
            i.classList.add("fas", "fa-poo-storm");
            break;
        case "13":
            i.classList.add("far", "fa-snowflake");
            break;
        case "50":
            i.classList.add("fas", "fa-smog");
            break;
        default:
            i.classList.add("far", "fa-question-circle");
    }
    return i;
};

const displayCurrentConditions = (currentConditionsArray) => {
    const ccContainer = document.getElementById("currentForecast__conditions");
    currentConditionsArray.forEach(cc => {
        ccContainer.appendChild(cc);
    });
};

const displaySixDayForecast = (weatherJson) => {
    for (let i = 1; i <=6; i++) {
        const dfArray = createDailyForecastDivs(weatherJson.daily[i]);
        displayDailyForecast(dfArray);
    }
};

const createDailyForecastDivs = (dayWeather) => {
    const dayAbbreviationText = getDayAbbreviation(dayWeather.dt);
    const dayAbbreviation = createElem("p", "dayAbbreviation", dayAbbreviationText);
    const dayIcon = createDailyForecastIcon(dayWeather.weather[0].icon,
        dayWeather.weather[0].description);
    const dayHigh = createElem("p", "dayHigh", `${Math.round(Number(dayWeather.temp.max))}°`);
    const dayLow = createElem("p", "dayLow", `${Math.round(Number(dayWeather.temp.min))}°`);
        return [dayAbbreviation, dayIcon, dayHigh, dayLow];
};


const getDayAbbreviation = (data) => {
    const dateObj = new Date(data * 1000);
    const utcString = dateObj.toUTCString();
    return utcString.slice(0, 3).toUpperCase();
};

const createDailyForecastIcon = (icon, altText) => {
    const img = document.createElement("img");
    if (window.innerWidth < 768 || window.innerHeight < 1025) {
        img.src = `https://openweathermap.org/img/wn/${icon}.png`;
    } else {
        img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    }
    img.alt = altText;
    return img;
};


const displayDailyForecast = (dfArray) => {
    const dayDiv = createElem("div", "forecastDay");
    dfArray.forEach(el => {
        dayDiv.appendChild(el);
    });
    const dailyForecastContainer = document.getElementById("dailyForecast__contents");
    dailyForecastContainer.appendChild(dayDiv);
};