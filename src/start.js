// React requirments
import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route } from "react-router-dom";
import { Link } from "react-router";

// Two main pages you can go to:

import Welcome from "./welcome";
import Logo from "./logo";

// These components swap in and out when path is /WELCOME
import Registration from "./register";
import Login from "./login";

const loggedRouter =
    <HashRouter>
        <div>
            <Route path="/" component={ Logo } />
        </div>
    </HashRouter>


const notLoggedRouter =
    <HashRouter>
        <div>
            <Route exact path="/" component={ Welcome } />
                <Route path="/register" component={Registration} />
                <Route path="/login" component={ Login } />
        </div>
    </HashRouter>


// this dictates which router we will use based on the url. In server, set cookies or something to dictace which url shows up.

let router;
if (location.pathname == "/welcome/") {
    router = notLoggedRouter;
} else {
    router = loggedRouter;
}

ReactDOM.render(router, document.querySelector("main"));
