import { Component } from '@angular/core';

import { MAIN } from '~/config/main';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class RegistryJourneyImportComponent {
  public operatorId;
  public gitbookLinkCSV = MAIN.gitbookLinkCSV;
}
