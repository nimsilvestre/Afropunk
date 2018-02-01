// React requirments
import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route } from "react-router-dom";
import { Link } from "react-router";

// Two main pages you can go to:

import Welcome from "./welcome";
import Logo from "./logo";


//WELCOME PAGE

//THIS CODE CHECK THE URL IN THE COOKIES TO SEE IF THE USER IS LOGGED IN
var component;

if (location.pathname == "/welcome/") {
    component = <Welcome />;
} else {
    component = <Logo />;
}
//REACTDOM - poe no html esta component
ReactDOM.render(
    component,
    document.querySelector("main") //passing TO THI html element
);
