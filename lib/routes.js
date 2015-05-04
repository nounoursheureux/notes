var basicAuth = require('basic-auth');

module.exports = function(app,auth,engine,baseDir) {
    if(!baseDir) baseDir = '';
    var api = require('./api').init(auth,engine);
    app.route('/' + baseDir)
        .get(api.list)
        .post(api.new);
    app.route('/' + baseDir + 'note/:id')
        .get(api.note)
        .put(api.update)
        .delete(api.delete);
    app.post('/' + baseDir + 'auth',api.register);
};
