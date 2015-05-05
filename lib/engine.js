var fs = require('fs'),
    db,filepath;

var engine = {};

engine.init = function(file)
{
    return new Promise(function(resolve,reject){
        filepath = file;
        fs.open(file,'r',function(err,fd){
            if(err && err.message.indexOf("ENOENT") > -1)
            {
                fs.open(file,'w+',function(err,fd){
                    if(err) throw err;
                    fs.write(fd,'{}',{encoding:'utf8'},function(err,written,data){
                        db = JSON.parse(data);
                        db.notes = [];
                        resolve(engine);
                    });
                });
            }
            else
            {
                fs.readFile(file,function(err,data){
                    if(err) throw err;
                    db = JSON.parse(data);
                    db.notes = [];
                    resolve(engine);
                });
            }
        });
    });
};

engine.createNote = function(title,content,owner,priv)
{
    return new Promise(function(resolve,reject){
        db.notes.push({title: title,content: content,owner: owner,private: priv,id:db.notes.length});
        resolve(title);
    });
};

engine.listNotes = function(username)
{
    return new Promise(function(resolve,reject){
        resolve(db.notes.filter(function(item){
            return item.owner == username;
        }));
    });
};

engine.getNote = function(username,id)
{
    return new Promise(function(resolve,reject){
        var note = db.notes.filter(function(item){
            return item.id == id;
        });
        if(note.length === 0) reject("The note doesn't exist");
        else if(note[0].private && note[0].owner != username) reject('Access not granted');
        else resolve(note[0]);
    });
};

engine.updateNote = function(username,id,newnote)
{
    return new Promise(function(resolve,reject){
        engine.getNote(username,id).then(function(note){
            if(newnote.owner != username) reject('Access not granted');
            else
            {
                if(newnote.title !== undefined) note.title = newnote.title;
                if(newnote.content !== undefined) note.content = newnote.content;
                if(newnote.private !== undefined) note.private = newnote.private;
                writeDB.then(function(){
                    resolve(note.title);
                },reject);
            }
        },reject);
    });
};

engine.deleteNote = function(username,id)
{
    return new Promise(function(resolve,reject){
        engine.getNote(username,id).then(function(note){
            if(note.owner != username){
                reject('Access not granted');
            }
            else
            {
                db.notes.splice(db.notes.indexOf(note),1);
                writeDB.then(resolve,reject);
            }
        },reject);
    });
};

var writeDB = function()
{
    return new Promise(function(resolve,reject){
        fs.writeFile(filepath,JSON.stringify(db),function(err){
            if(err) reject(err);
            else resolve();
        });
    });
};

module.exports = engine;
