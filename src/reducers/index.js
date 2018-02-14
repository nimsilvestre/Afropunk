import { combineReducers } from 'redux';
import FriendsReducer from './reducer_friends';
import FriendRequestsReducer from './reducer_friend_request';

const rootReducer = combineReducers({
    friends: FriendsReducer,
    friendRequests: FriendRequestsReducer,
});

export default rootReducer;

// this is referrng to the same thing as the start.js
