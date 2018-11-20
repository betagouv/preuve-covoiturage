import {Component, OnInit} from '@angular/core';
import {OperatorService} from "../../service/aomService";
import {FileSaverService} from "ngx-filesaver";

@Component({
    templateUrl: 'template.html',
    styleUrls: ['style.scss']
})

export class HomeComponent implements OnInit {

    private aomService;
    private preuveKeyValues: any = [];

    constructor(aomService: OperatorService, private fileSaverService: FileSaverService) {
      this.aomService = aomService;
    }

    ngOnInit() {
      this.aomService.getPreuveKeyValues().subscribe(res => {

        this.preuveKeyValues = res;

      });
    }

    getCsv() {
      this.aomService.getCsv().subscribe(res => {
        const d = new Date();
        this.fileSaverService.save(res, "Preuves_"+d.toLocaleDateString()+".csv");
      });
    }


}