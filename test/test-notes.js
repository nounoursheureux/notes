var chai = require('chai'),
    should = chai.should(),
    expect = chai.expect(),
    chaiAsPromised = require('chai-as-promised'),
    fs = require('fs'),
    express = require('express'),
    app = express(),
    bodyparser = require('body-parser'),
    request = require('request-promise'),
    auth,engine;

chai.use(chaiAsPromised);

after('Removing the test database',function(){
    fs.unlink('test/data.sql');
});

before('Creating the test database',function(){
    var authPromise = require('../auth').init('test/data.sql');
    var enginePromise = require('../engine').init('test/data.sql');
    return Promise.all([authPromise,enginePromise]).then(function(values){
        auth = values[0];
        engine = values[1];
    },function(error){
        throw error;
    });
});

describe('Auth',function(){
    it('should create a new user',function(){
        return auth.register('testuser','testpassword','testemail').should.eventually.equal('testuser');
    });
    it('should return an error when the user already exists',function(){
        return auth.register('testuser','testpassword','testemail').should.be.rejectedWith('The user already exists');
    });
    it('should login',function(){
        return auth.login('testuser','testpassword').should.eventually.equal('testuser');
    });
    it('should return "This user doesn\'t exist"',function(){
        return auth.login('nonexistent','testpassword').should.be.rejectedWith('This user doesn\'t exist');
    });
    it('should return "Bad password"',function(){
        return auth.login('testuser','anotherpassword').should.be.rejectedWith('Bad password');
    });
});
describe('Engine',function(){
    it('should create a new note',function(){
        return engine.createNote('title','content','testuser',true).should.eventually.equal('title');
    });
    var note = {title:'title',content:'content',owner:'testuser',id:1,private:1};
    it('should list all the notes',function(){
        return engine.listNotes('testuser').should.eventually.eql([note]);
    });
    it('should return the first note',function(){
        return engine.getNote('testuser',1).should.eventually.eql(note);
    });
    it('should return an error because the user is not allowed to view this note',function(){
        return engine.getNote('anotheruser',1).should.be.rejectedWith('Access not granted');
    });
    it("should return an error because the note doesn't exists",function(){
        return engine.getNote('testuser',2).should.be.rejectedWith("The note doesn't exist");
    });
    var newnote = {title: 'anothertitle',content:'anothercontent',owner:'testuser',id:1,private:1};
    it('should update the note',function(){
        engine.updateNote('testuser',1,newnote).then(function(){
            return engine.getNote('testuser',1).should.eventually.eql("lolilol");
        });
    });
    it('should return an error because the user is not allowed to change this note',function(){
        return engine.updateNote('anotheruser',1,newnote).should.be.rejectedWith('Access not granted');
    });
    it('should delete the note',function(){
        return engine.deleteNote('testuser',1).should.be.fullfilled;
    });
    it('should return an error because the note has been deleted',function(){
        return engine.getNote('testuser',1).should.be.rejectedWith("The note doesn't exist");
    });
});
describe('API',function(){
    app.use(bodyparser.json());
    app.listen(5555);
    var routes;
    it('should register me',function(){
        routes = require('../routes')(app,auth,engine);
        var user = {
            username: 'apiuser',
            password: 'apipassword',
            email: 'apiemail'
        };
        var options = {
            json: true,
            method: 'POST',
            uri: 'http://localhost:5555/auth',
            body: user
        };
        return request(options).should.eventually.equal('Success');
    });
    it('should return an error because the user already exists',function(){
        var user = {
            username: 'apiuser',
            password: 'apipassword',
            email: 'apiemail'
        };
        var options = {
            json: true,
            method: 'POST',
            uri: 'http://localhost:5555/auth',
            body: user
        };
        return request(options).should.eventually.eql({error: 'The user already exists'});
    });
});
