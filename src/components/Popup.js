import React from "react"
import {FiX} from "react-icons/fi";
export default function Popup({setPopup,temperature,weather,description,cityName}) {

    return (
        <div className="popup-container">
            <FiX onClick={()=>setPopup(false)} className="Icon"/>
            <div className="Popup">
                <h2>Today in <span>{cityName}</span></h2>
                <p>Temperature: <span>{temperature}</span>°C</p>
                <p>Weather: <span>{weather}</span></p>
                <p>Description: <span>{description}</span></p>
            </div>
        </div>


    )
}