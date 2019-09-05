import { Component, OnInit } from '@angular/core';

import { URLS } from '~/core/const/main.const';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  URLS = URLS;

  constructor() {}

  ngOnInit() {}
}
