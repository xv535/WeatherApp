"use strict";
import {
    setLocationObject,
    getHomeLocation,
    getWeatherFromCoords,
    getCoordsFromApi,
    cleanText,
} from "./dataFunctions.js";
import {
    setPlaceholderText,
    addSpinner,
    displayError,
    displayApiError,
    updateScreeReaderCnfirmation,
    updateDisplay,
} from "./domFunctions.js";
import CurrentLocation from "./CurrentLocation.js";
const currentLoc = new CurrentLocation();



const initApp = () => {
    //add listeners
    const geoButtons = document.querySelector("#getLocation");
    geoButtons.addEventListener("click", getGeoWeather);

    const homeButton = document.querySelector("#home");
    homeButton.addEventListener("click", loadWeather);

    const saveButton = document.querySelector("#saveLocation");
    saveButton.addEventListener("click", saveLocation);

    const unitButton = document.querySelector("#unit");
    unitButton.addEventListener("click", setUnitPref);

    const refreshButton = document.querySelector("#refresh");
    refreshButton.addEventListener("click", refreshWeather);

    const locationEntry = document.getElementById("searchBar__form");
    locationEntry.addEventListener("submit", submitNewLocation);

    //set up

    //load weather
    loadWeather();
};

document.addEventListener("DOMContentLoaded", initApp);

const getGeoWeather = (event) => {
    if (event) {
        if (event.type === "click") {
            //add spinner
            const mapIcon = document.querySelector(".fa-map-marker-alt");
            addSpinner(mapIcon);
        }
    }
    if (!navigator.geolocation) return geoError();
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
};

const geoError = (errObj) => {
    const errMsg = errObj ? errObj.message : "Geolocation not supported";
    displayError(errMsg, errMsg);
};

const geoSuccess = (position) => {
    const myCoordsObj = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        name: `Lat:${position.coords.latitude} Long:${position.coords.longitude}`,
    };
    //set location object
    setLocationObject(currentLoc, myCoordsObj);

    //update data and display
    updateDataAndDisplay(currentLoc);
};

const loadWeather = (event) => {
    const savedLocation = getHomeLocation();
    if (!savedLocation && !event) return getGeoWeather();
    if (!savedLocation && event.type === "click") {
        displayError(
            "No Home location saved.",
            "Sorry, Please, save your home location first."
        );
    } else if (savedLocation && !event) {
        displayHomeLocationWeather(savedLocation);
    } else {
        const homeIcon = document.querySelector(".fa-home");
        addSpinner(homeIcon);
        displayHomeLocationWeather(savedLocation);
    }
};

const displayHomeLocationWeather = (home) => {
    if (typeof home === "string") {
        const locationJson = JSON.parse(home);
        const myCoordsObj = {
            lat: locationJson.lat,
            lon: locationJson.lon,
            name: locationJson.name,
            unit: locationJson.unit,
        };
        setLocationObject(currentLoc, myCoordsObj);
    }
};

const saveLocation = () => {
    if (currentLoc.getLat() && currentLoc.getLon()) {
        const saveIconc = document.querySelector(".fa-save");
        addSpinner(saveIconc);
        const location = {
            name: currentLoc.getName(),
            lat: currentLoc.getLat(),
            lon: currentLoc.getLon(),
            unit: currentLoc.getUnit(),
        };
        localStorage.setItem("defaultWeatherLocation", JSON.stringify(location));
        updateScreeReaderCnfirmation(
            `Saved ${currentLoc.getName} as home location.`
        );
    }
};

const setUnitPref = () => {
    const unitIcon = document.querySelector(".fa-chart-bar");
    addSpinner(unitIcon);
    currentLoc.toggleUnit();
    updateDataAndDisplay(currentLoc);
};

const refreshWeather = () => {
    const refreshIcon = document.querySelector(".fa-sync-alt");
    addSpinner(refreshIcon);
    updateDataAndDisplay(currentLoc);
};

const submitNewLocation = async (event) => {
    event.preventDefault();
    const text = document.querySelector(".searchBar__text").value;
    const entryText = cleanText(text);
    if (!entryText.length) return;
    const locationIcon = document.querySelector(".fa-search");
    addSpinner(locationIcon);
    const coordsData = await getCoordsFromApi(entryText, currentLoc.getUnit());
    console.log(coordsData);
    //work with API data
    if (coordsData) {
        if (coordsData.cod == 200) {
            //succes
            const myCoordsObj = {
                lat: coordsData.coord.lat,
                lon: coordsData.coord.lon,
                name: coordsData.sys.country ? `${coordsData.name}, ${coordsData.sys.country}`
                    : coordsData.sys.name
            };
            setLocationObject(currentLoc, myCoordsObj);
            updateDataAndDisplay(currentLoc);
        } else {
            displayApiError(coordsData);
        }
    } else {
        displayError("Connection error", "Connection error");
    }
};



const updateDataAndDisplay = async (locationObj) => {
    const weatherJson = await getWeatherFromCoords(locationObj);
    if (weatherJson) updateDisplay(weatherJson, locationObj);
  };

