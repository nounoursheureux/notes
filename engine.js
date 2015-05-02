var sqlite3 = require('sqlite3'),
    db;

var engine = {};

engine.init = function(database)
{
    db = new sqlite3.Database(database);
    return engine;
};

engine.createNote = function(title,content,owner,priv)
{
    return new Promise(function(resolve,reject){
        db.run("INSERT INTO notes VALUES(NULL,?,?,?,?);",[title,content,owner,(priv)?1:0],function(error){
            if(error) reject(error);
            else resolve(title);
        });
    });
};

engine.listNotes = function(username)
{
    return new Promise(function(resolve,reject){
        db.all("SELECT * FROM notes WHERE owner='" + username + "';",function(err,data){
            if(err) throw err;
            else resolve(data);
        });
    });
};

engine.getNote = function(username,id)
{
    return new Promise(function(resolve,reject){
        db.get("SELECT * FROM notes WHERE id=?",id,function(err,data){
            if(err) reject(err.message);
            if(data === undefined) reject('The note doesn\'t exist');
            else
            {
                if(data.private && username != data.owner) reject('Access not granted');
                else resolve(data);
            }
        });
    });
};

engine.updateNote = function(username,id,newnote)
{
    return new Promise(function(resolve,reject){
        db.serialize(function(){
            engine.getNote(username,id).then(function(note){
                var updatedNote;
                if(newnote.title === undefined) updatedNote.title = note.title;
                else updatedNote.title = newnote.title;
                if(newnote.content === undefined) updatedNote.content = note.content;
                else updatedNote.content = newnote.content;
                if(newnote.private === undefined) updatedNote.private = note.private;
                else updatedNote.private = newnote.private;
                db.run("UPDATE notes SET (title,content,private) = (?,?,?); WHERE id=?",[updated.title,updatedNote.content,updateNote.private,id],function(error){
                    if(error) reject(error.message);
                    else resolve(newnote);
                });
            },reject);
        });
    });
};

engine.deleteNote = function(username,id)
{
    return new Promise(function(resolve,reject){
        engine.getNote(username,id).then(function(note){
            db.run("DELETE FROM notes WHERE id=?",id,function(error){
                if(error) reject(error);
                else resolve();
            });
        },reject);
    });
};

module.exports = engine;
