var express = require('express');
var router = express.Router();

var welcomeMessage = 'Pad created! Share the URL with a friend to edit text in real-time.'

router.get('/:id', function (req, res, next) {
    res.render('pad', { title: 'Pad', temp: welcomeMessage })
})

module.exports = router;
