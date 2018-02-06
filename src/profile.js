import React from "react";
import axios from './axios';

import { ProfilePic } from './profilepic';
import { Logo } from './logo';
import { UserBio } from './userbio';

export class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            first: "",
            email: "",
            bio: "",
            setBio: "",
            error: false
        };
    }
    setBio() {
        this[e.target.name] = e.target.value; //function to change Edit bio
    }
    submit() {
        axios.post("/updateBio", {
            bio: this.bio
        }).then(({ data }) => {
            if (data.sucess) {
                //location.replace
            } else {
            }
        });
    }
    render() {
        return (
            
        )
    }

}



/*id={this.state.id}
first={this.state.first}
last={this.state.last}
profilePic={this.state.profilePic}
bio={this.state.bio}
setBio={this.setBio}*/
