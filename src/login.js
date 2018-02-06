import React from "react";
import axios from "./axios"; //axios with csurf- change in every component that requires ajax requests
//import { HashRouter, Route } from 'react-router-dom';
import { Link } from "react-router-dom";

export class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            error: false
        };
    }

    setFieldValue(e) {
        this[e.target.name] = e.target.value;
    }

    submit() {
        axios.post("/login", {
            email: this.email,
            password: this.password
        })
        .then(({ data }) => {
            if (data.success) {
                location.replace("/"); //This is necessary to unable to backspace in the browser
            } else {
                this.setState({
                error: true
                });
            }
        });
    }

    render() {
        return (
            <div>
                {this.state.error && <div>FAILURE</div>}
                <p>Email</p>
                <input placeholder="Email" name="email" onChange={e => this.setFieldValue(e)} />
                <p>Password</p>
                <input placeholder="Password" name="pass" onChange={e => this.setFieldValue(e)} />
                <button onClick={() => this.submit()}>Login</button>
                <div>
                    <Link to="/"> Not registered yet?</Link>
                </div>
            </div>
        );
    }
}
