import React from "react";
import { ProfilePic } from "./profilepic";
import axios from "./axios";


export class OtherUser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: '',
            user: '',
            bio: '',
            /*friendStatusCode: '',
            friendButtonMessage: '',
            sender: ''*/
        };
    }

componentWillReceiveProps(nextProps) {
    console.log('Going into:',nextProps);
}

componentDidMount() {
    //will call after calling render - one life cycle component
    const id = this.props.match.params.id;
    axios.get("/user/info/" + id)
        .then(({ data }) => {
            if (!data.sucess) {
                this.props.history.push('/');
            } else {
                this.setState ({
                        first: data.first,
                        last: data.last,
                        image: data.imageUrl,
                        bio: data.bio
                    })
            }
    });
}

    render() {
        let image;
        if (!this.props.image) {
            image = "./public/default.png";
        } else {
            image = this.props.image;
        }

        return (
            <div className="other-profile">
                <h3>First Name:</h3>
                <p>{this.state.first}</p>
                <h3>Last Name:</h3>
                <p>{this.state.last}</p>
                <h3>About you:</h3>
                <p>{this.state.bio}</p>
                <div className="profile-picture">
                    <img src="{this.state.image}"/>
                </div>
            </div>
        );
    }
}
