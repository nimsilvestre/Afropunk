import React from "react";

export default function ProfilePic(props) {
    let image;
    if (!props.image) {
        image = "./public/default.png";
    } else {
        image = props.image;
    }
    return (
         <div>
            <img onClick={props.showUploader} src={image} alt={props.first + ' ' + props.last} />
         </div>
    )
}


//link this thing to the user profile!
