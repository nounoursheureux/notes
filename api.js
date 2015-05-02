var basicAuth = require('basic-auth'),
    engine,auth;

var api = {};

api.init = function(Auth,Engine)
{
    auth = Auth;
    engine = Engine;
    return api;
};

api.register = function(req,res)
{
    if(!req.body) res.json({error: 'No POST data'});
    if(!req.body.username) res.json({error: 'Username field missing'});
    if(!req.body.password) res.json({error: 'Password field missing'});
    if(!req.body.email) res.json({error: 'Email field missing'});
    auth.register(req.body.username,req.body.password,req.body.email).then(function(username){
        res.end('Success');
    }, function(error){
        res.json({error: error});
    });
};

api.new = function(req,res)
{
    if(!(req.body.content)) res.json({error:'Missing note content'});
    if(!(req.body.title)) res.json({error:'Missing note title'});
    var priv = req.body.private;
    if(priv === undefined) priv = true;
    api.login(req).then(function(username){
        engine.createNote(req.body.title,req.body.content,username,priv).then(function(title){
            res.end('Successfully created note: ' + title);
        },function(error){
            res.json(error);
        });
    },function(error){
        res.json(error);
    });
};

api.list = function(req,res)
{
    api.login(req).then(function(username){
        engine.listNotes(username).then(function(notes){
            res.json(notes);
        },function(error){
            res.json(error);
        });
    },function(error){
        res.json(error);
    });
};

api.note = function(req,res)
{
    api.login(req).then(function(username){
        engine.getNote(username,req.params.id).then(function(data){
            res.json(data);
        },function(error){
            res.json(error);
        });
    });
};

api.login = function(req)
{
    return new Promise(function(resolve,reject){
        var credentials = basicAuth(req);
        if(!credentials) reject({message:'Missing auth credentials'});
        auth.login(credentials.name,credentials.pass).then(resolve,reject);
    });
};

api.update = function(req,res)
{
    api.login(req).then(function(username){
        if(!req.body) res.json({error:'Missing updated note'});
        else if(!req.body.id) res.json({error: 'Missing note ID'});
        else engine.updateNote(username,req.body.id,req.body).then(function(note){
            res.json(note);
        },function(error){
            res.json({error:error});
        });
    },function(error){
        res.json(error);
    });
};

api.delete = function(req,res)
{
    api.login(req).then(function(username){
        if(!req.body.id) res.json({error: 'Missing note ID'});
        else engine.deleteNote(username,req.body.id).then(function(){
            res.end('Successfully delete note: '+req.body.id);
        },function(error){
            res.json({error:error});
        });
    },function(error){
        res.json(error);
    });
};

module.exports = api;
