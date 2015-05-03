var sqlite3 = require('sqlite3').verbose(),
    fs = require('fs'),
    crypto = require('crypto'),
    db,salt;

var auth = {};

auth.init = function(database,salt)
{
    return new Promise(function(resolve,reject){
        db = new sqlite3.Database(database);
        salt = salt || ':h4cK3rW4r';
        db.run("CREATE TABLE IF NOT EXISTS users(username VARCHAR(20) UNIQUE,password CHAR(128),email VARCHAR(50))",function(error){
            if(error) reject(error);
            else resolve(auth);
        });
    });
};

auth.register = function(username,password,email)
{
    return new Promise(function(resolve,reject) {
        var mix = username + ':' + password + this.salt;
        var hash = crypto.createHash('sha512');
        hash.update(mix);
        var hashedPass = hash.digest('hex');
        db.serialize(function() {
            db.get("SELECT username FROM users WHERE username=?;",username,function(err,data){
                if(err) throw err;
                if(data === undefined) // The user doesn't exists yet
                {
                    db.run("INSERT INTO users VALUES (?,?,?);",[username,hashedPass,email],function(error){
                        if(error) reject(error);
                        else resolve(username);
                    });
                }
                else
                {
                    reject('The user already exists');
                }
            });
        });
    });
};

auth.login = function(username,password)
{
    return new Promise(function(resolve,reject) {
        var mix = username + ':' + password + this.salt;
        var hash = crypto.createHash('sha512');
        hash.update(mix);
        var hashedPass = hash.digest('hex');
        db.serialize(function() {
            db.get("SELECT username FROM users WHERE username='" + username +"';",function(err,data) {
                if(err) throw err;
                if(data === undefined) reject('This user doesn\'t exist');
                else db.get("SELECT username FROM users WHERE username='" + username + "' AND password='" + hashedPass + "';",function(err,data) {
                    if(err) throw err;
                    if(data === undefined) reject('Bad password');
                    else resolve(username);
                });
            });
        });
    });
};

module.exports = auth;
