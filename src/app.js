import React from "react";
import axios from "./axios";
import { BrowserRouter, Route, Link } from "react-router-dom";

import { Logo } from "./logo";
//import { Profile } from "./profile";
import ProfilePic from "./profilepic";
import Uploader from "./uploaderPic";
// import Profile from './profile';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: "",
            image: "",
            uploaderShouldBeVisible: false,
            uploadFile: "",
            bio: ""
        };
    }

    componentDidMount() {
        //will call after calling render - one life cycle component
        axios.get("/user").then(({ data }) => {
            this.setState({
                first: data.first,
                last: data.last,
                id: data.id,
                imageUrl: data.imageUrl,
                bio: data.bio
            });
        });
    }

    showUploader() {
        console.log("clicked pic");
        this.setState({
            uploaderShouldBeVisible: true
        });
    }

    updateProfileImg(image) {
        this.setState({ image });
    }

    updateBio(bio) {
        this.setState({ bio });
    }

    render() {
        return (
            <div>
            <Logo />
            <ProfilePic image = {this.state.image} showUploader={() => this.showUploader()} />
            {this.state.uploaderShouldBeVisible && <Uploader setImage={(img) => this.setImage(img)} />}
            <a href="/logout">Click here to logout</a>
            </div>
        )
    }
}

/*
<Route
    path="/"
    render={() => (
        <Profile
            id={this.state.id}
            first={this.state.first}
            last={this.state.last}
            profilePic={this.state.profilePic}
            bio={this.state.bio}
            setBio={this.setBio} />)}
*/
