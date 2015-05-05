var fs = require('fs'),
    crypto = require('crypto'),
    users,file;

var auth = {};

auth.init = function(filepath,salt)
{
    return new Promise(function(resolve,reject){
        salt = salt || ':h4cK3rW4r';
        file = filepath;
        fs.open(file,'r+',function(error,fd){
            if(error && error.message.indexOf("ENOENT") > -1)
            {
                fs.open(file,'w+',function(err,fd){
                    if(err) throw err;
                    fs.write(fd,'{}',{encoding:'utf8'},function(err,written,data){
                        users = JSON.parse(data);
                        resolve(auth);
                    });
                });
            }
            else
            {
                fs.readFile(file,function(err,data){
                    if(err) throw err;
                    users = JSON.parse(data);
                    resolve(auth);
                });
            }
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
        if(users[username] === undefined)
        {
            users[username] = {
                username: username,
                password: hashedPass,
                email: email
            };
            fs.writeFile('test/users.json',JSON.stringify(users),function(err){
                if(err) reject(err);
                else resolve(username);
            });
        }
        else reject('The user already exists');
    });
};

auth.login = function(username,password)
{
    return new Promise(function(resolve,reject) {
        var mix = username + ':' + password + this.salt;
        var hash = crypto.createHash('sha512');
        hash.update(mix);
        var hashedPass = hash.digest('hex');
        if(users[username] === undefined) reject("This user doesn't exist");
        else if(users[username].password != hashedPass) reject('Bad password');
        else resolve(username);
    });
};

module.exports = auth;
