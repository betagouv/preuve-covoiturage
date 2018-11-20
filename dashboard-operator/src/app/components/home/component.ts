import {Component, OnInit} from '@angular/core';
import {OperatorService} from "../../service/operatorService";
import {FileSaverService} from "ngx-filesaver";

@Component({
    templateUrl: 'template.html',
    styleUrls: ['style.scss']
})

export class HomeComponent implements OnInit {

    private operator;
    private preuveKeyValues: any = [];

    constructor(operator: OperatorService, private fileSaverService: FileSaverService) {
      this.operator = operator;
    }

    ngOnInit() {
    }


}