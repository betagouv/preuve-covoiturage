import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {Response, ResponseContentType} from '@angular/http';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {LoggerService} from "../applicativeService/logger/service";




@Injectable()
export class AomService {

  constructor(private http: HttpClient, private loggerService: LoggerService
  ) {
    this.loggerService = loggerService;
  }


  getCsv() {

    return this.http.get('/aom/csv', { responseType: 'blob'});
  }

}