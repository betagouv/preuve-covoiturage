const express = require("express");
const router = express.Router();
const passport = require("passport");
const csv = require('csv');

require("../passport")(passport);


router.get("/csv", async (req, res) => {
  // const query = {};
  // if (req.query.group && req.query.group !== "admin") {
  //   query.group = req.query.group;
  // }
  try {

    csv.generate({seed: 1, columns: 2, length: 20}, function(err, data){
      csv.parse(data, function(err, data){
        csv.transform(data, function(data){
          return data.map(function(value){return value.toUpperCase()});
        }, function(err, data){
          csv.stringify(data, function(err, data){
            res.attachment('test.csv');
            res.status(200).set({
              'Content-Type': 'text/csv',
            }).send(data);

          });
        });
      });
    });


  } catch (e) {
    capture(e);
    return res.status(500).send({ e });
  }




});




module.exports = router;
