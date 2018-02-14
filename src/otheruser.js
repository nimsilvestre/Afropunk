import React from "react";
import { ProfilePic } from "./profilepic";
import axios from "./axios";

export class OtherUser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: "",
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
                            loggedInUserIsSender: result.data.isSender
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
                axios.post('/getRelStatus', {userId : this.state.id}).then((result) => {
                        this.setState({relStatus : result.data.status, loggedInUserIsSender: result.data.isSender});
                        console.log(this.state);
                })
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

        console.log('rendering otheruser', this.state);

        return (
            <div className="other-profile">
                <div className="profile-picture">
                    <img className="otherprofile-pic" src={image} />
                </div>
                <div>
                    {this.state.relStatus == "none" && (
                        <button

                            onClick={() => this.changeRelStatus("send")}>
                            Send friend request
                        </button>
                    )}
                    {this.state.relStatus == "accept" && (
                        <button
                            onClick={() => this.changeRelStatus("accept")}
                        >
                            Accept friend request
                        </button>
                    )}
                    {this.state.relStatus == "pending" && (
                        <button
                            onClick={() => this.changeRelStatus("cancel")}
                        >
                            Delete friend request
                        </button>
                    )}
                    {this.state.relStatus == "friends" && (
                        <button
                            onClick={() => this.changeRelStatus("unfriend")}
                        >
                            Unfriend
                        </button>
                    )}
                </div>
                <h3>First Name:</h3>
                <p>{this.state.first}</p>
                <h3>Last Name:</h3>
                <p>{this.state.last}</p>
                <h3>About me:</h3>
                <p>{this.state.bio}</p>
            </div>
        );
    }
}
