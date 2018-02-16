import React from "react";
import axios from "./axios";
import { BrowserRouter, Route } from "react-router-dom";
//import {browserHistory} from 'react-router';

import { Link } from "react-router-dom";

import { Reducer } from "./reducers";
import Friends from "./friends";
import OnlineUsers from "./onlinefriends";

import { OtherUser } from "./otheruser";
import { Profile } from "./profile";
import { ProfilePic } from "./profilepic";
import Uploader from "./uploaderPic";
import { UserBio } from "./userbio";

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
        this.showUploader = this.showUploader.bind(this);
    }

    componentDidMount() {
        //will call after calling render - one life cycle component
        axios.get("/user").then(({ data }) => {
            this.setState({
                id: data.id,
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
                        <Link to="/" className="logoProfile">
                            AFROPUNK
                        </Link>
                        <nav>
                            <Link className="friends-btn" to="/friends">
                                Friends
                            </Link>
                            <Link className="online-btn" to="/onlinefriends">
                                {" "}
                                Online Friends
                            </Link>
                            <a className="logout-btn" href="/logout">
                                Logout
                            </a>
                        </nav>
                        <div className="profile-size">
                            <ProfilePic
                                image={this.state.image}
                                showUploader={() => this.showUploader()}
                            />
                        </div>
                    </header>
                    {this.state.uploaderShouldBeVisible && (
                        <Uploader
                            setImage={img => this.setState({ image: img })}
                        />
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
                                setBio={this.setBio}
                                showUploader={this.showUploader}
                            />
                        )}
                    />
                    <Route exact path="/user/:id" component={OtherUser} />
                    <Route path="/friends" component={Friends} />
                </div>
            </BrowserRouter>
        );
    }
}
//<Route path='/online' component={OnlineUsers}/>
