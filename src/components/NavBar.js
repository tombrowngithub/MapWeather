import React from "react"
import {FiMenu,FiX} from "react-icons/fi";



export default function NavBar({nav, setNav}) {

    return (
        <div className="navbar">
            <div onClick={()=>setNav(!nav)}>
                {!nav ?<FiMenu className="Icon"/> : <FiX className="Icon"/> }
            </div>

        </div>


    )
}