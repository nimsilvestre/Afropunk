import React from "react";
import axios from "./axios";
import { Profile } from "./profile";
import { App } from "./app";

export default class UserBio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(e) {
        this.setState({
            bio: this.textarea.value
        });
        console.log(this.state);
    }

    handleSubmit(e) {
        axios
            .post("/updateBio", { bio: this.state.bio })
            .then(res => {
                if (res.data.success) {
                    location.replace("/profile");
                } else {
                    console.log(err);
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    render() {
        return (
            <div>
                <textarea
                    className="bioText"
                    ref={textarea => (this.textarea = textarea)}
                    onChange={this.handleChange}
                />
                <button
                    onClick={e => {
                        this.handleSubmit(e);
                    }}
                >
                    Submit
                </button>
            </div>
        );
    }
}

/*    console.log("loggin edit bio state", this.state);
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
}*/
