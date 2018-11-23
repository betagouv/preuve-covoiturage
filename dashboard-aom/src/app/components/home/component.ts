import {Component, OnInit} from '@angular/core';
import {AomService} from "../../service/aomService";
import {FileSaverService} from "ngx-filesaver";

@Component({
    templateUrl: 'template.html',
    styleUrls: ['style.scss']
})

export class HomeComponent implements OnInit {

    private aomService;
    private aom: any;

    constructor(aomService: AomService,private fileSaverService: FileSaverService) {
      this.aomService = aomService;
    }

    ngOnInit() {
      this.aomService.getAom().subscribe(res => {

        this.aom = res[0];

      });
    }

    getCsv() {
      this.aomService.getCsv().subscribe(res => {
        const d = new Date();
        this.fileSaverService.save(res, "Preuves_"+d.toLocaleDateString()+".csv");
      });
    }


}