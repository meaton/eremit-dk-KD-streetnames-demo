var express = require('express');
var router = express.Router();
var romanize = require('romanize');
var moment = require('moment');

var schema = require('../model/schema.js');

router.get('/map-streets/get-documents/json/:start', function(req, res) {
  if (req.params.start) {
    var dateYear = new Date(req.params.start);
    var dateYear_1 = new Date(dateYear.getTime());
    dateYear_1.setFullYear(dateYear.getFullYear() + 10)

    schema.doc.find({ date: { $gte : dateYear, $lt: dateYear_1 }, streets: { $exists: true, $ne: [] } }, { _id: 0, did: 1, bind_no: 1, url_ref: 1, date: 1, streets: 1 }, function (err, docs) {
        if (err) res.send(err);
        res.json(docs);
    });
  }
});

router.get('/map-streets/get-documents/:start?', function(req, res) {
  var dateYear = null, query = null;
  if (req.query.street && req.query.street.length <= 255) {
    query = {  "streets.modern": req.query.street };

    if (req.params.start) {
      dateYear = new Date(req.params.start);
    }

    if (dateYear != null) {
      var dateYear_1 = new Date(dateYear.getTime());
      dateYear_1.setFullYear(dateYear.getFullYear() + 10);
      query.date = { $gte : dateYear, $lt: dateYear_1 };
    }

    schema.doc.find(query).select('did  bind_no url_ref date streets').sort('date').exec(function(err, docs) {
      if (!err) {
        if (docs && docs.length > 0) {
          docs = docs.map((v) => {
            v.bind_no = romanize(v.bind_no);
            v.dateFormatted = moment(v.date).format('DD-MM-YYYY');
            return v;
          });

          res.render('documents', {
            documents: docs,
            target: req.query.street
          });
        }
      }
    });
  }
});

router.get('/map-streets/document/:ref', function(req, res) {
  if (req.params.ref && req.params.ref.length == 24) {
    var ObjectId = schema.Types.ObjectId;
    var query = { "_id": new ObjectId(req.params.ref) };

    if (req.query.street && req.query.street.length <= 255)
      query["streets.modern"] = req.query.street;

    schema.doc.findOne(query).select('did bind_no url_ref streets').exec(function(err, doc) {
      if (!err) {
        if (doc) {
          res.json(doc)
        } else {
          res.status(500).send('No document found.');
        }
      } else {
        res.status(500).send(err.message);
      }
    });
  }
});

router.get('/map-streets/location/:street', function(req, res) {
  if (req.params.street && req.params.street.length <= 255) {
    schema.street.findOne({ "properties.Gadenavn": req.params.street }, { _id: 0, 'geometry._id': 0, '__v': 0 }, function(err, geodata) {
      if (err) res.send(err);
      geodata.properties = geodata.properties[0]; //TODO change to single object in database
      res.json(geodata);
    });
  }
});

router.get('/map-streets/:type/all', function (req, res) {
  var types = ['modern', 'original'];
  if (req.params.type && types.indexOf(req.params.type) != -1) {
    schema.doc.find().distinct('streets.' + req.params.type , function (err, docs) {
        res.json(docs);
    });
  }
});

module.exports = router;
