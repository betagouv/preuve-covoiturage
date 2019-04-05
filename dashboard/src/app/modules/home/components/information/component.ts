import { Component , Injectable } from '@angular/core';

import { MAIN } from '~/config/main';


@Component({
  selector : 'app-homepage-information',
  templateUrl : 'template.html',
  styleUrls : ['style.scss'],
})

@Injectable()
export class HomePageInformationComponent {
  mainSiteLink = MAIN.mainSiteLink;
  documentationLink = MAIN.gitbookLink;
  contactEmail = MAIN.contactEmail;
}
