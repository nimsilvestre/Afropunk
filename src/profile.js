import React from "react";
import axios from "./axios";
import { ProfilePic } from "./profilepic";
import { UserBio } from "./userbio";
import { App } from "./app";

export class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bioIsVisible: false
        };
        this.handleBio = this.handleBio.bind(this);
    }
    handleBio(e) {
        this.setState(prevState => ({
            bioIsVisible: !prevState.bioIsVisible
        }));
    }

    render() {
        return (
            <div className="profile">
                <div className="user-profilepic">
                    <ProfilePic image={this.props.image} />
                    <div className="user-info">
                        <h3>First Name:</h3>
                        <p>{this.props.first}</p>
                        <h3>Last Name:</h3>
                        <p>{this.props.last}</p>
                        <div className="user-bio">
                            <h3>About you:</h3>
                            <button onClick={this.handleBio}>Edit your bio</button>
                            {this.state.bioIsVisible && <UserBio />}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
