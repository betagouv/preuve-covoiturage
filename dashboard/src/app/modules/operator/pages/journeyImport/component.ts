import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '~/applicativeService/authentication/service';
import { MAIN } from '~/config/main';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class OperatorJourneyImportComponent implements OnInit {
  public operatorId;
  public gitbookLinkCSV: string;

  constructor(private authentificationService: AuthenticationService,
  ) {
    this.gitbookLinkCSV = MAIN.gitbookLinkCSV;
  }

  ngOnInit() {
    this.operatorId = this.authentificationService.getUser().operator;
  }
}
