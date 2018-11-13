const express = require("express");
const router = express.Router();
const passport = require("passport");
const csv = require('csv');

require("../passport")(passport);

const header = ["Nom de l'opérateur", "id du passager ou conducteur", "latitude au départ", "longitude au départ", "date depart", "insee départ", "lat arrivée", "lon arrivée", "date arrivée", "insee arrivée"]

router.get("/csv",  passport.authenticate("jwt", { session: false }), async (req, res) => {


  try {

    csv.generate({seed: 1, columns: ['ascii', 'int', 'int', 'int', 'int', 'int', 'int','int', 'int' ,'int'], length: 20}, function(err, data){  // <-- to generate random table
      csv.parse(data, function(err, data){
        data[0] = header;
        csv.transform(data, function(data){
          return data.map(function(value){return value.toUpperCase()});
        }, function(err, data){
          csv.stringify(data, function(err, data){
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
