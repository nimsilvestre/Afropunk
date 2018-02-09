import React from "react";
import { ProfilePic } from "./profilepic";
//import { UserBio } from "./userbio";


export class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className="profile">
                <div className="user-profilepic">
                    <ProfilePic image={this.props.image} />
                </div>
                    <div className="user-info">
                        <h3>First Name:</h3>
                        <p>{this.props.first}</p>
                        <h3>Last Name:</h3>
                        <p>{this.props.last}</p>
                        <div className="user-bio">
                        <h3>About you:</h3>
                        <p>{this.props.bio}</p>
                        <button>Edit your bio</button>
                    </div>
                </div>
            </div>
        );
    }
}
