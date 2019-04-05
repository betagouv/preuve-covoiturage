import { LazyLoadEvent, MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { Observable, of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';

import { ApiResponse } from '~/entities/responses/apiResponse';

@Injectable()
export class ApiService {
  private filters = {};
  public http: HttpClient;
  public messageService: MessageService;
  public endPoint: string;
  public messages = {
    created: 'La resource a bien été crée.',
    deleted: 'La resource a bien été supprimée.',
    updated: 'La resource a bien été mise à jour',
  };

  constructor(http: HttpClient, messageService: MessageService) {
    this.http = http;
    this.messageService = messageService;
  }

  /**
   * filters is Array of [ [ key, value, comparaison ] ]
   */
  get(filters:any[any] = [], options = {}): any {
    const params = this.getUrlParams(filters);
    return this.http.get(`${this.endPoint}${params}`, options);
  }

  post(item: any): Observable<any> {
    const cleanedItem = this.cleanObject(item);
    return this.http
        .post<object>(`${this.endPoint}`, cleanedItem)
        .pipe(map((response: ApiResponse) => {
          this.messageService.add({
            severity: 'info',
            summary: this.messages.created,
          });
          return response.data;
        }));
  }

  put(item: any, key: string, value: string): Observable<any> {
    if (item[key] !== value && value !== null) {
      const put = {};
      put[key] = value;
      return this.http
          .put<object>(`${this.endPoint}/${item._id}`, put)
          .pipe(map((response: ApiResponse) => {
            this.messageService.add({
              severity: 'info',
              summary: this.messages.updated,
            });
            return response.data;
          }));
    }
    return observableOf();
  }

  patch(id: string, patch: object): Observable<any> {
    return this.http
        .put<object>(`${this.endPoint}/${id}`, patch)
        .pipe(map((response: ApiResponse) => {
          this.messageService.add({
            severity: 'info',
            summary: this.messages.updated,
          });
          return response.data;
        }));
  }

  getOne(id: string): any {
    return this.http
        .get(`${this.endPoint}/` + id)
        .pipe(map((response: ApiResponse) => response.data));
  }

  delete(id: string) {
    return this.http
        .delete(`${this.endPoint}/` + id)
        .pipe(map((response: ApiResponse) => {
          this.messageService.add({
            severity: 'info',
            summary: this.messages.deleted,
          });
          return response.data;
        }));
  }

  /* Filter format */

  formatFiltersFromLazyEvent(event: LazyLoadEvent) {
    const filters: any[any] = [];
    if (event.filters) {
      const keys = Object.keys(event.filters);
      if (keys.length > 0) {
        for (const key of keys) {
          let value = event.filters[key].value;
          if (!event.filters[key].matchMode) {
            value = `/${value}/i`;
            filters.push([key, value, event.filters[key].matchMode]);
          } else if (event.filters[key].matchMode === 'gt&lt') {
            filters.push([key, value[0], 'gt']);
            filters.push([key, value[1], 'lt']);
          } else {
            filters.push([key, value, event.filters[key].matchMode]);
          }
        }
      }
    }

    if (event.sortField && event.sortOrder) {
      const order = event.sortOrder === -1 ? '-' : '';
      filters.push(['sort', `${order}${event.sortField}`]);
    }

    filters.push(['page', event.first / event.rows + 1]);

    return filters;
  }

  /* Privates */

  private cleanObject(obj: any): any {
    for (const propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '') {
        delete obj[propName];
      }
    }
    return obj;
  }

  private getUrlParams(filters = []) {
    let sep = '?';
    let ret = '';
    let comparaison;

    if (filters.length > 0) {
      filters.forEach((value) => {
        let key = value[0];
        let vals;

        if (value[2]) {
          switch (value[2]) {
            case 'gt':
              comparaison = '>';
              vals = value[1];
              break;
            case 'lt':
              comparaison = '<';
              vals = value[1];
              break;
            case 'in':
              comparaison = '=';
              vals = value[1].join();
              break;
            case 'nin':
              comparaison = '!=';
              vals = value[1].join();
              break;
            case 'notexists':
              comparaison = '';
              vals = '';
              key = `!${key}`;
              break;
          }
        } else {
          comparaison = '=';
          vals = value[1];
        }
        ret += `${sep}${key}${comparaison}${vals}`;
        sep = '&';
      });
    }

    return ret;
  }
}
