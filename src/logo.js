import React from "react";
import { HashRouter, Route } from 'react-router-dom';
import { ProfilePic } from "./profilepic";
import { Uploader } from "./uploaderPic";
import { Link } from 'react-router-dom';


export function Logo() {
    return (
        <div>
        <Link className="logoName" to="/">AFROPUNK</Link>
        </div>
    );
}
