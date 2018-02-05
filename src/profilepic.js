import React from "react";
import { Logo } from './logo';

export default function ProfilePic(props) {
    if (!props.image) {
        return image = "./default.png";

    }
    console.log(image);
    return (
         <div>
         <img onClick={this.props.showUploader} src={props.user.image} alt={props.user.first + ' ' + props.user.last} />
         </div>
    )
}
