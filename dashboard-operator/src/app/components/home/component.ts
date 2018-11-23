import {Component, OnInit} from '@angular/core';
import {OperatorService} from "../../services/operatorService";
import {Proof} from "../../entities/proof/entity";
import {environment} from "../../../environments/environment";
import {operatorList} from "../../tmp_constants/operator";



@Component({
    templateUrl: 'template.html',
    styleUrls: ['style.scss']
})

export class HomeComponent implements OnInit {

    private operator;
    public proof = new Proof();
    public loading = false;
    public operatorList;

    constructor(operator: OperatorService) {
      this.operatorList = operatorList; // todo: should be fetched in database
      this.operator = operator;
      if( false === environment.production)
        this.proof = new Proof(
          {
            email: "samuel.eyre@beta.gouv.fr",
            lastname: "eyre",
            firstname: "samuel",
            numero: "0673924353",
            traveler_hash: "ojo0forj3434f43ferferf343",
            operator_id: "2",
            trust_level: 1,
            start: {
              insee: "64AA4",
              literal: "25 rue de lyon 69003 lyon",
              date: "2018-12-11",
              time: "10:00"
            },
            end: {
              insee: "64AA4",
              literal: "12 rue de l'ouest 69100 lyon",
              date: "2018-12-11",
              time: "10:30"
            },
            is_driver: null
          }
        )
    }

    ngOnInit() {
    }

    sendProof() {
      this.loading = true;
      this.operator.sendProof(this.proof).subscribe((response) => {
        this.loading = false;
      });
    }


}