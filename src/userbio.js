import React from 'react';
import axios from './axios';

export default class UserBio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            bio: "",
            editBio: "",
            setBio: "",
            error: false
        }
    }
    setBio() {
        this[e.target.name] = e.target.value;
    }
    submit() {
        axios.post("/updateBio", {
            bio: this.bio
        }).then(({ data }) => {
            if (data.sucess) {
                //location.replace("/");
            } else {

            }
        })
    }
}
