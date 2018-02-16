import axios from 'axios';
// it helps us to make the connection with the server site.
// actions are functions that returns objects
// and the objects have a type and payload:

export function fetchFriends() { // these are actions creators!!
    const req = axios.get('/getfriends');
    console.log(req);
    return {
        type: 'FETCH_FRIENDS',
        payload: req
        // payload: variable!
        // request is a string: axios.get for this moment, before this objects go to the reducers, the middler intersept it and it will check the payload, it will check that this contains an axios request (https)
        // that should execute, so it will execute that line of code and will go that data from the server and will put the data in the payload
        // when the middleware intersept the qury, it will ask the server for a information related to this route (axios.get.../)
    }
}

export function fetchFriendRequests() {
    const req = axios.get('/getfriendrequests');
    console.log(req);
    return {
        type: 'FETCH_FRIEND_REQUESTS',
        payload: req
    }
}

export function unfriend(id) {
    const req = axios.post('/unfriend', {userId: id}) // friends.js line 24 for the id inside of the button
    // we are sending the id of the friend we want to unfriend.
    return {
        type: 'UNFRIEND',
        payload: req // THE PAYLOAD JUST CONTAIN THE REQUEST,
    }
}

export function accept(id) {
    const req = axios.post('/acceptRequest', {userId: id})
    return {
        type: 'ACCEPT_REQUEST',
        payload: req
    }
}

// these objets are passed to the REDUCERS!! AND BEFORE THAT THEY pass Trought THE middleware: (m: are something
//u use to manipulate the objects!!in our case the middleware that we are using is redux promise
// to see the middleware go to start.js)
