import { Component, OnInit } from '@angular/core';

import { JourneyService } from '~/modules/journeys/services/journeyService';
import { AuthenticationService } from '~/applicativeService/authentication/service';


@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class DeclarationComponent implements OnInit {
  public operatorId;
  public group = null;
  constructor(private journeyService: JourneyService,
              private authentificationService: AuthenticationService,
    ) {
  }

  ngOnInit() {
    this.group = this.authentificationService.hasAnyGroup(['operators', 'registry']);

    // if on operator dashboard, get id of logged operator
    if (this.group === 'operators') {
      this.operatorId = this.authentificationService.getUser().operator; // todo: verify this !
    }
  }

  setOperator(operatorId) {
    this.operatorId = operatorId;
  }
}
