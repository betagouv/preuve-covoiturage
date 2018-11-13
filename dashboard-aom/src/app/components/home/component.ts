import {Component, OnInit} from '@angular/core';
import {AomService} from "../../service/aomService";
import {FileSaverService} from "ngx-filesaver";

@Component({
    templateUrl: 'template.html',
    styleUrls: ['style.scss']
})

export class HomeComponent implements OnInit {


    private aomService;

    constructor(aomService: AomService,private fileSaverService: FileSaverService) {
      this.aomService = aomService;
    }

    ngOnInit() {
    }

    getCsv() {
      this.aomService.getCsv().subscribe(res => {
        this.fileSaverService.save(res, "test.csv");
      });
    }


}