var spicedPg = require('spiced-pg');
const bcrypt = require('bcryptjs');
var db;

if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    db = spicedPg(`postgres:postgres:postgres@localhost:5432/soacialnetwork`);
}


// Register
exports.register = function(first, last, email, password) {
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
exports.hashPassword = function(plainTextPassword) {
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

/*
// User profile
exports.user = function( first, last, image, bio ) {

}
*/
