import React from "react";
import { HashRouter, Route } from "react-router-dom";
import { Registration } from "./register"; //curly because it is not the default component
import { Login } from "./login";

export function Welcome() {
    return (
        <div id="wlcm-container">

            <div className="wlcm header">
                <img className="logo-header" src="/public/test.png" />
                <h1>Welcome!</h1>
            </div>

            <div className="wlcm body">
            <HashRouter>
                <div>
                    <Route exact path="/" component={Registration} />
                    <Route path="/login" component={Login} />
                </div>
            </HashRouter>
            <div className="wlcm logo">
                <h1>EMPTY.</h1>
            </div>
            </div>

            <div className="wlcm footer">
                <footer className="wlcm-footer">
                    Copyright &copy; 2018 Natasha Silvestre
                </footer>
            </div>
            
        </div>
    );
}
