import React from "react";
import { ProfilePic } from "./profilepic";
import axios from "./axios";

export class OtherUser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: null,
            user: "",
            bio: "",
            details: {},
            relStatus: null,
            id: this.props.match.params.id
        };
    }

    changeRelStatus(action) {
        axios
            .post("/changeRelStatus", { action: action, userId: this.state.id })
            .then(() => {
                //after the necessary changes are made we are using this route to get the new state of the relationship so that we
                //can render the view again i.e change the text appearing in the button and changing the action which happens on
                //clicking that button
                axios
                    .post("/getRelStatus", { userId: this.state.id })
                    .then(result => {
                        this.setState({
                            relStatus: result.data.status,
                            user2_id: result.data.user2_id
                        });
                    });
            });
    }

    componentDidMount() {
        //will call after calling render - one life cycle component
        const id = this.props.match.params.id;
        axios.get("/user/info/" + id).then(({ data }) => {
            if (!data.sucess) {
                this.props.history.push("/");
            } else {
                this.setState({
                    first: data.first,
                    last: data.last,
                    image: data.imageUrl,
                    bio: data.bio
                });
                axios
                    .post("/getRelStatus", { userId: this.state.id })
                    .then(result => {
                        this.setState({
                            relStatus: result.data.status,
                            user2_id: result.data.user2_id
                        });
                        console.log(this.state);
                    });
            }
        });
    }

    render() {
        let image;
        if (!this.props.image) {
            image = "/public/default.png";
        } else {
            image = this.props.image;
        }

        console.log("rendering otheruser", this.state);

        return (
            <div className="other-profile">
                <div className="profile-picture">
                    <img className="otherprofile-pic" src={image} />
                    <div className="profile-info">
                        <h3>First Name:</h3>
                        <p>{this.state.first}</p>
                        <h3>Last Name:</h3>
                        <p>{this.state.last}</p>
                        <h3>About me:</h3>
                        <p>{this.state.bio}</p>
                    </div>
                </div>
                <div className="btn-friend_req">
                    {this.state.relStatus == "none" && (
                        <button
                            className="btn striped-shadow dark"
                            onClick={() => this.changeRelStatus("send")}
                        >
                            <span>Add Friend</span>
                        </button>
                    )}
                    {this.state.relStatus == "pending" &&
                        this.state.user2_id == this.state.id && (
                            <button
                                className="btn striped-shadow dark"
                                onClick={() => this.changeRelStatus("cancel")}
                            >
                                <span>Unfriend</span>
                            </button>
                        )}
                    {this.state.relStatus == "pending" &&
                        this.state.user2_id != this.state.id && (
                            <button
                                className="btn striped-shadow dark"
                                onClick={() => this.changeRelStatus("accept")}
                            >
                                <span>Accept</span>
                            </button>
                        )}
                    {this.state.relStatus == "accept" && (
                        <button
                            className="btn striped-shadow dark"
                            onClick={() => this.changeRelStatus("unfriend")}
                        >
                            <span>Unfriend</span>
                        </button>
                    )}
                </div>
            </div>
        );
    }
}
