import { Component, Input, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';

import { HeaderBag } from '~/applicativeService/interceptor/header-bag';
import { FORBIDDEN, NOTFOUND, UNAUTHORIZED } from '~/config/http';

import { JourneyService } from '../../../../services/journeyService';
import { environment } from '../../../../../../../environments/environment';

@Component({
  selector: 'app-journeys-upload',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class JourneyUploadComponent implements OnInit {
  @Input() operatorId: number;
  public journeysEndPoint;
  public errors: Object[];

  constructor(private journeyService: JourneyService, private messageService: MessageService) {
    this.journeysEndPoint = environment.apiUrl + this.journeyService.endPoint;
    this.errors = [];
  }

  ngOnInit(): void {
    // fix: nothing ?
  }

  beforeUpload(event) {
    this.errors = [];
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
    const response = JSON.parse(event.xhr.response);
    if (response.name && response.name === 'Error') {
      this.errors = [[{ severity: 'error', summary: response.message }]];
    } else {
      this.errors = (response.failed || []).reduce((acc, { journey_id, line, errors }) => {
        acc.push([
          {
            severity: 'error',
            summary: `Ligne ${line} - #${journey_id}`,
            detail: Object.keys(errors)
              .map((key) => `<br><strong>${key}</strong>: ${errors[key]}`)
              .join(''),
          },
        ]);

        return acc;
      }, []);
    }

    /**
     * Display a flash message
     */
    switch (event.xhr.status) {
      case UNAUTHORIZED:
      case FORBIDDEN:
        this.messageService.add({
          severity: 'error',
          summary: "Vous n'êtes pas connecté ou bien vous n'avez pas les droits",
        });
        break;
      case NOTFOUND:
        this.messageService.add({
          severity: 'error',
          summary: "La resource demandée n'a pas été trouvée",
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
