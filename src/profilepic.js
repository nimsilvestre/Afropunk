import React from "react";

export function ProfilePic(props) {
    let image;
    if (!props.image) {
        image = "/public/default.png";
    } else {
        image = props.image;
    }
    console.log(props);
    return (
        <div className="pic-holder" >
            <img
                className="profile-pic"
                onClick={props.showUploader}
                src={image}
                alt={props.first + " " + props.last}
            />
        </div>
    );
}
