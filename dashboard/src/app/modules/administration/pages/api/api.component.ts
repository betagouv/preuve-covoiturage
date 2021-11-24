import { Component } from '@angular/core';
import { URLS } from '~/core/const/main.const';

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.scss'],
})
export class ApiComponent {
  public apiAccessDoc = URLS.apiAccessDoc;
  public apiSchemaDoc = URLS.apiSchemaDoc;
  public faqOperator = URLS.faqOperator;

  constructor() {}
}
