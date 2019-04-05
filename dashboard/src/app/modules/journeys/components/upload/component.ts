import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';

import { HeaderBag } from '~/applicativeService/interceptor/header-bag';
import { FORBIDDEN, NOTFOUND, UNAUTHORIZED } from '~/config/http';

import { JourneyService } from '../../services/journeyService';
import { environment } from '../../../../../environments/environment';


@Component({
  selector: 'app-journeys-upload',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class JourneyUploadComponent implements OnInit {
  @Input() operatorId;
  public journeysEndPoint;

  constructor(private journeyService: JourneyService, private messageService: MessageService,
  ) {
    this.journeysEndPoint = environment.apiUrl + this.journeyService.endPoint;
  }

  ngOnInit(): void {
    // fix: nothing ?
  }

  beforeUpload(event) {
    event.formData.append('operator', this.operatorId);
    return event;
  }

  beforeSend(event) {
    const headers = HeaderBag.get([]);
    for (const i in headers) {
      if (headers.hasOwnProperty(i)) {
        event.xhr.setRequestHeader(headers[i].name, headers[i].value);
      }
    }
    return event;
  }

  onUpload(event) {
    this.messageService.add({
      severity: 'success',
      summary: 'Les trajets ont été uploadés.',
    });
  }

  onError(event) {
    switch (event.xhr.status) {
      case UNAUTHORIZED:
      case FORBIDDEN:
        this.messageService.add({
          severity: 'error',
          summary: 'Vous n\êtes pas connecté ou bien vous n\'avez pas les droits',
        });
        break;
      case NOTFOUND:
        this.messageService.add({
          severity: 'error',
          summary: 'La resource demandée n\'a pas été trouvée',
        });
        break;
      default:
        this.messageService.add({
          severity: 'error',
          summary: 'Une erreur est survenue',
        });
    }
  }
}
