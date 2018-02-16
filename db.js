console.log("LISTENING TO QUERIES");

const spicedPg = require("spiced-pg");
const bcrypt = require("bcryptjs");
var db;

const S3config = require("./config.json");

if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    db = spicedPg(`postgres:postgres:postgres@localhost:5432/soacialnetwork`);
}

// Register
module.exports.register = function(first, last, email, password) {
    const params = [first, last, email, password];
    const q = `INSERT INTO USERS (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id`;
    return db
        .query(q, params)
        .then(function(results) {
            console.log("db reg results", results.rows);
            return results.rows[0].id;
        })
        .catch(err => {
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
    return db
        .query(
            `SELECT *
     FROM users
     WHERE email = $1`,
            [email]
        )
        .then(results => {
            console.log("results from getUserInfo: ", results.rows);
            return results.rows[0];
        })
        .catch(function(err) {
            console.log("error in getUserInfo", err);
            throw err;
        });
};

// Get profile info
module.exports.getProfileInfo = function(id) {
    console.log("id:", id);
    const q = `SELECT * FROM users WHERE id = $1`;
    const params = [id];
    return db.query(q, params).then(results => {
        console.log("results from db.getProfileInfo: ", results.rows[0]);
        return results.rows[0];
    });
};

// send photo to database
module.exports.updateProfilePic = function(img, id) {
    // const imgUrl = S3config.s3Url + img;
    const params = [img, id];
    console.log(params);

    const q = "UPDATE users SET imageUrl = $1 WHERE id = $2 RETURNING imageUrl";
    return db
        .query(q, params)
        .then(results => {
            console.log("results from db updateprofilepic: ", results.rows[0]);
            return results.rows[0];
        })
        .catch(err => {
            console.log("err in updateProfilePic", err);
        });
};

//Update / set bio
module.exports.updateUserBio = function(bio, id) {
    const q = `UPDATE users
            SET bio = $1 WHERE id = $2`;
    const params = [bio, id];
    return db.query(q, params);
};

module.exports.getUserInfoById = function(id) {
    const q = `
    SELECT * FROM users
    WHERE  id = $1`;
    const params = [id];
    return db
        .query(q, params)
        .then(results => {
            return results.rows[0];
        })
        .catch(err => {
            console.log("Theres an error on db getUserInfoById", err);
        });
};

//MODULE FRIEND REQUEST
module.exports.sendRequestStatus = function(user1_id, user2_id) {
    const q = `SELECT curr_status, user2_id FROM friends
    WHERE (user1_id = $1 AND user2_id = $2)
        OR  (user1_id = $2 AND user2_id = $1)`;
    const params = [user1_id, user2_id];
    return db
        .query(q, params)
        .then(results => {
            return results.rows[0];
        })
        .catch(err => {
            console.log("Here was the error", err);
        });
};

module.exports.addFriendReq = function(user1_id, user2_id, curr_status) {
    const q = `
        INSERT INTO friends (user1_id, user2_id, curr_status)
        VALUES ($1, $2, $3)
        RETURNING id`;
    const params = [user1_id, user2_id, curr_status];
    return db
        .query(q, params)
        .then(results => {
            console.log(
                "RESULTS || ADDFRIENDREQ.results.rows[0]",
                results.rows[0]
            );
            return results.rows[0];
        })
        .catch(err => {
            console.log("ERR IN ADDFRIENDREQ || DB.JS", err);
        });
};

module.exports.cancelFriendReq = function(user1_id, user2_id) {
    const q = `
        DELETE FROM friends WHERE user1_id = $1 AND user2_id = $2`;
    const params = [user1_id, user2_id];
    return db
        .query(q, params)
        .then(results => {
            console.log("RESULTS || CANCELED FRIENDREQ", results);
            console.log("RESULTS || CANCELED.results.rows[0]", results.rows[0]);
            return results.rows[0];
        })
        .catch(err => {
            console.log("ERR IN CANCELFRIENDREQ || DB.JS", err);
        });
};

module.exports.acceptFriendReq = function(user1_id, user2_id, curr_status) {
    console.log("accept func");
    const q = `
        UPDATE friends SET curr_status = 2
        WHERE (user1_id = $2
        AND user2_id = $1) OR (user1_id = $1
        AND user2_id = $2)  `;
    const params = [user1_id, user2_id];
    return db
        .query(q, params)
        .then(results => {
            return results;
        })
        .catch(err => {
            console.log("err | db.js | accept friend", err);
        });
};

module.exports.deleteFriend = function(user1_id, user2_id) {
    const q = `
        DELETE FROM friends
        WHERE user1_id = $1 AND user2_id = $2
        OR user1_id = $2 AND user2_id = $1`;
    const params = [user1_id, user2_id];
    return db
        .query(q, params)
        .then(results => {
            return results;
        })
        .catch(err => {
            console.log("err | db.js | delete friend", err);
        });
};

module.exports.getFriends = function(userId) {
    const q = `SELECT users.first, users.last, users.imageUrl
                FROM users
                JOIN friends
                ON (user1_id = usersId AND user1_id = $1)
                OR (user2_id = user.id AND user2_id = $1 AND user2_id = $1)
                WHERE curr_status = 2
                AND (user2_id = $1 OR user1_id = $1)`;
    params = [userId];
    return db.query(q, params).then(results => {
        console.log("getFriends FROM DB:", RESULTS);
        result = result.rows.map(row => {
            //console.log('db.getFriends', results);
            if (row.imageUrl) {
                row.imageUrl = config.s3Url + row.imageUrl;
            }
            return row;
            console.log("getFriends FROM DB:", row);
        });
    });
};
/*

module.exports.getFriendRequests = function() {
    const params = [userId, 1];
    const q = `SELECT users.id, users.first, users.last, users.imageUrl
               FROM users
               JOIN friends
               ON (user1_id = users.id)
               WHERE curr_status = $2
               AND (user2_id = $1)`;
    return new Promise(function(resolve, reject) {
        db.query(q, params).then((result) => {
            result = result.rows.map((row) => {
                if(row.imageUrl) {
                    row.imageUrl = config.s3Url + row.imageUrl;
                }
                return row;
            })
           resolve(result);
        })
    })
}



*/
