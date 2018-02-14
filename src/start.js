// React requirments
import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route } from "react-router-dom";
import { Link } from "react-router";

//REDUX
import { createStore, applyMiddleware } from 'redux';
import ReduxPromise from 'redux-promise'; // that is the middleware
import { Provider } from "react-redux";
import reducers from './reducers';

// Two main pages you can go to:
import { Welcome } from "./welcome";
import { Logo } from "./logo";
import App from "./app";


//THIS CODE CHECK THE URL IN THE COOKIES TO SEE IF THE USER IS LOGGED IN
var component;
// ReduxPromise is the middleware!!!
const createStoreWithMiddleware = applyMiddleware(ReduxPromise)(createStore);
// createStore is refering to our storage!

if (location.pathname == "/welcome") {
    component = <Welcome />;
} else {
    component = <Provider store ={createStoreWithMiddleware(reducers)}><App /></Provider>
}


//REACTDOM - rendering to html this component
ReactDOM.render(
    component,
    document.querySelector("main") //passing TO THI html element
);
  <App />
