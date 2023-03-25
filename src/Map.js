import React, {useRef, useEffect, useState} from "react";
import mapboxgl from "mapbox-gl";
import {CiSearch} from 'react-icons/ci';
import geoJson from "./geojson.json";
import NavBar from "./components/NavBar";
import Popup from "./components/Popup";
import 'mapbox-gl/dist/mapbox-gl.css';
// eslint-disable-next-line import/no-webpack-loader-syntax
//mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default; 

const weatherApi = {
    key: "8d8a86c8e525d8cb00d8c2850dfb03fd",
    url: "https://api.openweathermap.org/data/2.5/",
}

const token = "pk.eyJ1IjoidG9tYnJvd24zIiwiYSI6ImNsZmdteXZqYTNhZ3MzeXBjNW1xczloZDgifQ.5dnZhnEskNaSnHs92Sh2PQ"
mapboxgl.accessToken = token
let map
export default function Map() {
    const mapContainerRef = useRef(null);
    //const [selectedCity, setSelectedCity] = useState(null);
    const [weather, setWeather] = useState({});
    const [search, setSearch] = useState("")
    const [cityList, setCityList] = useState([])
    const [nav, setNav] = useState(false)
    const [popup, setPopup] = useState(false)

    useEffect(() => {
        setCityList(geoJson.features)
    }, [])

    // Initialize map when component mounts
    useEffect(() => {
        map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [12.4829321, 41.8933203],
            zoom: 5,
        });

        // Add navigation control (the +/- zoom buttons)
        map.addControl(new mapboxgl.NavigationControl(), "top-right");

        // Clean up on unmount
        return () => map.remove();
    }, []);

    function handleCity(city) {
        fetch(`${weatherApi.url}weather?q=${city.properties.city}&units=metric&APPID=${weatherApi.key}`)
            .then((res) => res.json())
            .then((result) => {
                setWeather(result);
            });

        setNav(false)

        // Pan and zoom the map to the location of the city
        map.flyTo({
            center: city.geometry.coordinates,
            zoom: 9,
            essential: true
        });
        map.loadImage(
            "https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png",
            function (error, image) {
                if (error) throw error;
                map.addImage("custom-marker", image);
                // Add a GeoJSON source with multiple points
                map.addSource("points", {
                    type: "geojson",
                    data: {
                        type: "FeatureCollection",
                        features: geoJson.features,
                    },
                });
                // Add a symbol layer
                map.addLayer({
                    id: "points",
                    type: "symbol",
                    source: "points",
                    layout: {
                        "icon-image": "custom-marker",
                        // get the title name from the source's "title" property
                    },
                });

                // Add a popup for each marker on click
                map.on("click", "points", function (e) {
                    const coordinates = e.features[0].geometry.coordinates.slice();
                    setPopup(true)
                    // Create a popup
                    new mapboxgl.Popup()
                        .setLngLat(coordinates)
                        .setHTML(`<p>${city.properties.city}</p>
                            ${typeof weather.main !== "undefined" ? (
                            <div>
                                <p>{weather.main.temp}°C</p>
                                <p>{weather.weather[0].main}</p>
                                <p>({weather.weather[0].description})</p>
                            </div>
                        ) : (
                            ""
                        )}
                               `)
                        .addTo(map);
                });

                // Change the cursor to a pointer when the mouse is over the points layer
                map.on("mouseenter", "points", function () {
                    map.getCanvas().style.cursor = "pointer";
                });

                // Change it back to a pointer when it leaves
                map.on("mouseleave", "points", function () {
                    map.getCanvas().style.cursor = "";
                });
            }
        );
    }

    function handleInput(e) {
        setSearch(e.target.value)
        if (search !== "") {
            setNav(true)
        }
    }


    function handleBtn() {
        if (search) {
            fetch(`https://nominatim.openstreetmap.org/search?q=${search}&format=json&limit=1`)
                .then((res) => res.json())
                .then((result) => {
                    const searchCoordinate = {
                        lat: result[0].lat,
                        lon: result[0].lon
                    };

                    // Add default marker at searched location
                    new mapboxgl.Marker()
                        .setLngLat([searchCoordinate.lon, searchCoordinate.lat])
                        .addTo(map);

                    map.flyTo({
                        center: [searchCoordinate.lon, searchCoordinate.lat],
                        zoom: 9,
                        essential: true
                    });


                    map.on("click", "points", function (e) {
                        setPopup(true)
                        console.log("Hello")
                        new mapboxgl.Popup()
                            .setLngLat([searchCoordinate.lon, searchCoordinate.lat])
                            .addTo(map);
                    })

                });
        }

    }

    return (
        <div className="App">
            <NavBar
                nav={nav}
                setNav={setNav}
                cityList={cityList}
                search={search}
                handleCity={handleCity}
            />

            {/*For desktop layout*/}
            <div className="sideBar">
                <h1>CITIES</h1>
                <ul className="cities-container">
                    {cityList
                        .filter((city) =>
                            city.properties.city.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((city, index) => (
                            <li onClick={() => handleCity(city)} key={index}>
                                {city.properties.city}
                            </li>
                        ))}
                </ul>
            </div>

            {/*For mobile layout*/}
            {nav && <div className="cities-container-mobile">
                <h1>CITIES</h1>
                <ul>
                    {cityList
                        .filter((city) =>
                            city.properties.city.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((city, index) => (
                            <li className="list" onClick={() => handleCity(city)} key={index}>
                                {city.properties.city}
                            </li>
                        ))}
                </ul>
            </div>}

            <div className="container">
                <div className="searchContainer">
                    <CiSearch className="Icon"/>
                    <input
                        onChange={(e) => handleInput(e)}
                        className="searchBar"
                        type="search"
                        value={search}
                        placeholder="Search Cities"/>
                    <button
                        onClick={handleBtn}
                        className="searchBtn">Search
                    </button>
                </div>
            </div>
            <div className="map-container" ref={mapContainerRef}/>

            {/*I created a custom popup, some issues I had no time to debug in the setHTML of the map */}
            {popup && <Popup
                setPopup={setPopup}
                cityName={weather.name}
                temperature={weather.main.temp}
                weather={weather.weather[0].main}
                description={weather.weather[0].description}
            />}
        </div>

    )
}
