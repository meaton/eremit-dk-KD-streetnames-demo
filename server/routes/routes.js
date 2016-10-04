var schema = require('../model/schema.js');

module.exports = function(server) {
    // Defining all the routes
    server.get('/', function(req, res) {
        res.render('index.html');
    });

    server.get('/map-streets/filter/:start', function(req, res) {
      if (req.params.start) {
          var dateYear = new Date(req.params.start);
          var dateYear_1 = new Date(dateYear.getTime());

          dateYear_1.setFullYear(dateYear.getFullYear() + 10)

          console.log(dateYear.getFullYear());

          schema.doc.find({ date: { $gte : dateYear, $lt: dateYear_1 }, streets: { $exists: true, $ne: [] } }, { _id: 0, did: 1, bind_no: 1, url_ref: 1, date: 1, streets: 1 }, function (err, docs) {
              if (err) res.send(err);
              res.json(docs);
          });
      }
    });

    server.get('/map-streets/location/:name', function(req, res) {
      if (req.params.name) {
        schema.street.findOne({ "properties.Gadenavn": req.params.name }, { _id: 0, 'geometry._id': 0, '__v': 0 }, function(err, geodata) {
          if (err) res.send(err);
          geodata.properties = geodata.properties[0];
          res.json(geodata);
        });
      }
    });

    server.get('/map-streets/:type/all', function (req, res) {
      if (req.params.type) {
        schema.doc.find().distinct('streets.' + req.params.type , function (err, docs) {
            res.json(docs);
        });
      }
    });
};
