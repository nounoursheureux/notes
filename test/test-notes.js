var chai = require('chai'),
    should = chai.should(),
    expect = chai.expect(),
    chaiAsPromised = require('chai-as-promised'),
    fs = require('fs'),
    request = require('request-promise'),
    notes = require('../');

chai.use(chaiAsPromised);

after('Removing the test database',function(){
    fs.unlink('test/data.json');
    fs.unlink('test/users.json');
});

before('Creating the test database',function(){
    return notes.startServer(5555,'test/data.json','test/users.json').then(function(values){
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
    var note = {title:'title',content:'content',owner:'testuser',id:0,private:true};
    it('should list all the notes',function(){
        return engine.listNotes('testuser').should.eventually.eql([note]);
    });
    it('should return the first note',function(){
        return engine.getNote('testuser',0).should.eventually.eql(note);
    });
    it('should return an error because the user is not allowed to view this note',function(){
        return engine.getNote('anotheruser',0).should.be.rejectedWith('Access not granted');
    });
    it("should return an error because the note doesn't exists",function(){
        return engine.getNote('testuser',1).should.be.rejectedWith("The note doesn't exist");
    });
    var newnote = {title: 'anothertitle',content:'anothercontent',owner:'testuser',id:1,private:true};
    it('should update the note',function(){
        engine.updateNote('testuser',0,newnote).then(function(){
            return engine.getNote('testuser',0).should.eventually.eql("lolilol");
        });
    });
    it('should return an error because the user is not allowed to change this note',function(){
        return engine.updateNote('anotheruser',0,newnote).should.be.rejectedWith('Access not granted');
    });
    it('should delete the note',function(){
        return engine.deleteNote('testuser',0).should.be.fullfilled;
    });
    it('should return an error because the note has been deleted',function(){
        return engine.getNote('testuser',0).should.be.rejectedWith("The note doesn't exist");
    });
});
describe('API',function(){
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
    it('should register me',function(){
        return request(options).should.eventually.equal('Success');
    });
    it('should return an error because the user already exists',function(){
        return request(options).should.eventually.eql({error: 'The user already exists'});
    });
    var note = {
        title: 'testtitle',
        content: 'yolocontent',
        private: false
    };
    it('should create a new note',function(){
        options.uri = 'http://localhost:5555/';
        options.body = note;
        options.auth = {
            user: user.username,
            pass: user.password
        };
        return request(options).should.eventually.equal("Successfully created note: " + options.body.title);
    });
    it('should return all the notes',function(){
        options.method = 'GET';
        return request(options).should.eventually.eql([{title: 'testtitle',content:'yolocontent',private:false,id:0,owner:user.username}]);
    });
});
