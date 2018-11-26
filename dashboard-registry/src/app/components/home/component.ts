import {Component, OnInit} from '@angular/core';
import {RegistryService} from "../../services/registryService";
import {Proof} from "../../common/entities/proof/entity";
import {environment} from "../../../environments/environment";



@Component({
    templateUrl: 'template.html',
    styleUrls: ['style.scss']
})

export class HomeComponent implements OnInit {

    private registryService;

    constructor(registryService: RegistryService) {
    }
    ngOnInit() {

    }


}