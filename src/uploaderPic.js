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
        console.log(this.file);
        var formData = new FormData();
        formData.append('file', this.file);
        // formData.append('id', user.id);

        axios.post('/pic-upload', formData)
        .then(({data}) => {
            console.log(data);
            this.props.setImage(data.imageUrl)
        })
    }
    render() {
        return (
            <div className="upload-modal">
                <input type="file" name="file" onChange={this.chooseFile} />
                <button type="button" onClick={this.uploadPic}>Submit</button>
            </div>
        )
    }
}
