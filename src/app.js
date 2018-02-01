import React from 'react';
import axios from "axios";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            uploaderShouldBeVisible: false;
            setImage: false
        };
    }
    componentDidMount() { //will call after calling render - one life cycle component
        axios.get('/user').then(({data}) => this.setState()) {
            id: data.id,
            first: data.first,
            last: data.last,
            image: data.profilepic
        }
        showUploader() {
            this.setState({
                uploaderShouldBeVisible: true
            })
        }
    }
    render() {
        return (
            if (!this.state.id) {
                return 'Loading...';
            }
            <div>
                <ProfilePic images={this.state.image} showUploader={() => this.showUploader()} />
                <label htmlFor=""></label>
                {this.state.uploaderShouldBeVisible && <Uploader setImage={(img) => this.setImage(img)} />}
            </div>
        )
    }
}

function profilePic(props) { //decides when to call the function when its clicked on
    if (!props.image) {
        return null;
    }
    return <img onClick={this.props.showUploader} src={props.image} alt={props.first + ' ' + props.last}
}
