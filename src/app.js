import React from 'react';
import axios from "./axios";
import { BrowserRouter, Route, Link } from "react-router-dom";

//import Logo from './logo.js';

import Welcome from './welcome';
import ProfilePic from './profilepic';
import Uploader from './uploader';
import Profile from './profile';


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: '',
            image: '',
            uploaderShouldBeVisible: false,
            uploadFile: '',
            bio: ''
        };

    }

    componentDidMount() { //will call after calling render - one life cycle component
        axios.get('/user')
        .then(({ data }) => {
            this.setState({
                first: data.first,
                last: data.last,
                id: data.id,
                imageUrl: data.imageUrl,
                bio: data.bio,
            });
        });
    }

    showUploader() {
        this.setState({
            uploaderShouldBeVisible: true
        })

    }

    updateProfileImg(image) {
        this.setState({ image })
    }

    updateBio(bio) {
        this.setState({ bio })
    }


    render() {
        return (
            <div>
                <ProfilePic image = {this.state.image} showUploader={() => this.showUploader()} />

                {this.state.uploaderShouldBeVisible && <Uploader setImage={(img) => this.setImage(img)} />}

                            <div>
                                <a href="/logout">Click here to logout</a>
                            </div>
            </div>

        )
    }
}
