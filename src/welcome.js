import React from "react";
//import axios from "axios";
import { HashRouter, Route } from "react-router-dom";


import { Registration } from './register'; //curly because it is not the default component
import { Login } from './login';


export function Welcome() {
    return (
        <div id="welcome">
            <h1>Welcome!</h1>
            <img src="/public/test.png" />
            <HashRouter>
                <div>
                    <Route exact path="/" component={ Registration } />
                    <Route path="/login" component={ Login } />
                </div>
            </HashRouter>
        </div>
    );
}
