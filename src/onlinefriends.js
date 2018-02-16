import React, { Component } from 'react';
import { connect } from 'react-redux';

class OnlineUsers extends Component {
    constructor(props) {
        super(props);
    }

    renderOnlineUsersList() {
        if(!this.props.onlineUsers) {
            return <div>No user currently logged in</div>
        }
        else {
            this.props.onlineUsers.map((user) => {
                <span>{user.first}</span>
            })
        }
    }

    render() {
        <div className="online-users-grid">
            {this.renderOnlineUsersList()}
        </div>

    }
}

function mapStateToProps(state) {
    return {
        onlineUsers: state.onlineUsers
    }
}

export default connect(mapStateToProps)(OnlineUsers);
