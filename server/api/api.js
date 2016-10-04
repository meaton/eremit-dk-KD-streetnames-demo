var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.json({ message: "success" });
});

router.post('/', function (req, res) {
    var body = req.body;

    res.status(200).json({
        code: 200,
        message: "success"
    });
});

module.exports = router;
