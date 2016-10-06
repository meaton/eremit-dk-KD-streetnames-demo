module.exports = function(server) {
    server.get('/', function(req, res) {
        res.render('index.html', {
          dateStart: 1450,
          dateEnd: 1540,
          dateInterval: 10
        });
    });
};
