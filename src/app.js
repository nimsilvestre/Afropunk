import React from "react";
import axios from "./axios";
import { BrowserRouter, Route, Link } from "react-router-dom";

import { Profile } from "./profile";
import {ProfilePic } from "./profilepic";
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
        this.showUploader = this.showUploader.bind(this)
    }

    componentDidMount() {
        //will call after calling render - one life cycle component
        axios.get("/user").then(({ data }) => {
            this.setState({
                first: data.first,
                last: data.last,
                id: data.id,
                image: data.imageUrl,
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
            <BrowserRouter>
                <div className="wrapper">
                    <header className="header-profile">
                    <h1 className="logoProfile">AFROPUNK</h1>
                    <nav>
                    <a className="logout-btn" href="/logout">LOG OUT</a>
                    </nav>
                    <div className="profile-size">
                    <ProfilePic
                        image={this.state.image}
                        showUploader={() => this.showUploader()}
                    />
                    </div>
                    </header>
                    {this.state.uploaderShouldBeVisible && (
                        <Uploader setImage={img => this.setState({image: img})} />
                    )}
                    <Route
                        exact
                        path="/"
                        render={() => (
                            <Profile
                                id={this.state.id}
                                first={this.state.first}
                                last={this.state.last}
                                image={this.state.image}
                                bio={this.state.bio}
                                updateBio={this.updateBio}
                                showUploader={this.showUploader}
                            />
                        )}
                    />
                </div>
            </BrowserRouter>
        );
    }
}
