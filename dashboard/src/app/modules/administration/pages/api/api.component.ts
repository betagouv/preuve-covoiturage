import { Component, OnInit } from '@angular/core';

import { URLS } from '~/core/const/main.const';

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.scss'],
})
export class ApiComponent implements OnInit {
  public gitbookLinkAPIConnexion = URLS.gitbookLinkAPIConnexion;
  public gitbookLinkAPIFormat = URLS.gitbookLinkAPIFormat;
  public faqOperator = URLS.faqOperator;

  constructor() {}

  ngOnInit() {}
}
