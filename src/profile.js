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
                    <h3>
                        {this.props.first} {this.props.last}
                    </h3>
                    <div className="user-bio">
                        {this.props.bio} <button>Edit your bio</button>
                    </div>
                </div>
            </div>
        );
    }
}
