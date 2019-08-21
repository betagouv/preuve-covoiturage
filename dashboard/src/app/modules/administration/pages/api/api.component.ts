import { Component, OnInit } from '@angular/core';

import { MAIN } from '~/core/const/main.const';

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.scss'],
})
export class ApiComponent implements OnInit {
  public gitbookLinkAPIConnexion = MAIN.gitbookLinkAPIConnexion;
  public gitbookLinkAPIFormat = MAIN.gitbookLinkAPIFormat;
  public faqOperator = MAIN.faqOperator;

  constructor() {}

  ngOnInit() {}
}
