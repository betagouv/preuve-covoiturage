import { Component , Injectable } from '@angular/core';

import { MAIN } from '~/config/main';

@Component({
  selector : 'app-stat-header',
  templateUrl : 'template.html',
  styleUrls : ['style.scss'],
})

@Injectable()
export class StatisticsHeaderComponent {
  mainSiteLink = MAIN.mainSiteLink;
}
