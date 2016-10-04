// Mongoose import
var mongoose = require('mongoose');

var mongocfg = {
  port: process.env.MONGODB_PORT || 27017,
  host: process.env.MONGODB_HOST || 'localhost',
  db: 'kddata'
};

mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://' + mongocfg.host + ':' + mongocfg.post + '/' + mongocfg.db);

module.exports = {};
module.exports.doc = mongoose.model('KD_document', mongoose.Schema({
  did: {
    type: String,
    required: true
  },
  bind_no: {
    type: String,
    required: true
  },
  content: String,
  url_ref: String,
  date: Date,
  harvested_on: {
    type: Date,
    default: Date.now
  },
  word_count: Number,
  streets: [{
    original: String,
    modern: String
  }]
}, { versionKey: false }));
module.exports.street = mongoose.model('KD_feature', mongoose.Schema({
  type: { type: String, default: 'Feature' },
  properties: mongoose.Schema.Types.Mixed,
  geometry: mongoose.Schema.Types.Mixed,
  bbox: [Number]
}, { versionKey: false }));
