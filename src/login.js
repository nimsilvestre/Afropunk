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
        axios
            .post("/login", {
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
            <div className="login-form">
                <h2>LOGIN</h2>
                <p>Email</p>
                <input
                    placeholder="Email"
                    name="email"
                    onChange={e => this.setFieldValue(e)}
                />
                <p>Password</p>
                <input
                    placeholder="Password"
                    name="password"
                    type="password"
                    onChange={e => this.setFieldValue(e)}
                />
                <button className="button" onClick={() => this.submit()}>Login</button>
                {this.state.error && (
                    <div>Invalid Authentification! Try again.</div>
                )}
                <Link className="login-hover" to="/">
                    Register
                </Link>
            </div>
        );
    }
}
