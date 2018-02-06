import React from 'react';
import axios from './axios';


export default class Uploader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.chooseFile = this.chooseFile.bind(this);
        this.uploadPic = this.uploadPic.bind(this);
    }
    chooseFile(e) {
        this.file = e.target.files[0];

    }
    uploadPic() {
        //ajax to where??
        var formData = new FormData();
        formData.append('file', this.file);
        formData.append('id', this.user.id);

        axios.post('/pic-upload', FormData)
        .then((res) => {
            this.props.updateProfilePic(res.data.imageUrl)
        })
        // resolve
    }
    render() {
        return (
            <div>
                <input type="file" name="file" onChange={this.setFieldValue} />
                <button type="button" onClick={this.uploadPic}>Submit</button>
            </div>
        )
    }
}
