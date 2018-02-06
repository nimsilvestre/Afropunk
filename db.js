console.log('LISTENING TO QUERIES');

const spicedPg = require('spiced-pg');
const bcrypt = require('bcryptjs');
var db;

const S3config = require('./config.json');

if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    db = spicedPg(`postgres:postgres:postgres@localhost:5432/soacialnetwork`);
}


// Register
module.exports.register = function(first, last, email, password) {
    const params = [first, last, email, password];
    const q = `INSERT INTO USERS (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id`;
    return db.query(q, params).then(function(results) {
        console.log("db reg results", results.rows);
        return results.rows[0].id;
    }).catch((err) => {
        console.log("error in sending registration data to db", err);
    });
};

// Hash password
module.exports.hashPassword = function(plainTextPassword) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt((err, salt) => {
            if (err) {
                console.log("error in bcrypt.genSalt", err);
            }
            bcrypt.hash(plainTextPassword, salt, (err, hash) => {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
};


// check password on login
module.exports.checkPassword = function(plainTextPassword, storedHash) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(plainTextPassword, storedHash, (err, match) => {
            if (err) {
                reject(err);
            } else {
                resolve(match);
            }
        });
    });
};


// match password up with user info for logged In Router
module.exports.getUserInfo = function(email) {
    return db.query(`SELECT *
     FROM users
     WHERE email = $1`,[email]).then((results) => {
        console.log("results from getUserInfo: ", results.rows);
        return results.rows[0];
    }).catch(function(err) {
        console.log("error in getUserInfo", err);
        throw err;
    });
};


// Get profile info
module.exports.getProfileInfo = function(id) {
    console.log("id:", id);
    const q = `SELECT * FROM users WHERE id = $1`;
    const params = [ id ];
    return db.query(q, params)
        .then(results => {
            console.log("results from db.getProfileInfo: ", results.rows[0]);
            return results.rows[0];
        });
};


// send photo to database
module.exports.updateProfilePic = function(img, id) {
    // const imgUrl = S3config.s3Url + img;
    const params = [img, id];
    const q = 'UPDATE users SET imageUrl = $1 WHERE id = $2 RETURNING imageUrl';
    return db.query(q,params)
        .then((results) => {
            console.log("results from db updateprofilepic: ", results.rows[0]);
            return results.rows[0];
        }).catch((err) => {
            console.log("err in updateProfilePic", err);
        });
};


//Update / set bio
module.exports.updateBio = function(bio, id) {
    const params = [bio, id];
    const q = `
        UPDATE users
        SET bio = $1
        WHERE id = $2
        RETURNING bio`;
    return db.query(q,params)
        .then((results) => {
            console.log("results from updateBio db", results.rows[0]);
            return results.rows[0];
        }).catch((err) => {
            console.log("error in updateBio db", err);
        });
};

/*
function getFriendStatus(aId, bId) {
    const q = `SELECT * FROM `
}

1 = pending
2 = accepted
3 = rejected
4 = canceled
5 = terminated
*/
