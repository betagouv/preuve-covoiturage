import {Component, OnInit} from '@angular/core';
import {RegistryService} from "../../services/registryService";
import {Proof} from "../../common/entities/proof/entity";
import {environment} from "../../../environments/environment";
import {ProofService} from "../../services/proofService";



@Component({
    templateUrl: 'template.html',
    styleUrls: ['style.scss']
})

export class HomeComponent implements OnInit {

    private proofService;

    constructor(proofService: ProofService) {
      this.proofService = proofService;
    }


    ngOnInit() {
      this.proofService.get().subscribe((proofs => {
        console.log(proofs);
      }));
    }


}