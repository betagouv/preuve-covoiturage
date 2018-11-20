import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LoggerService} from "../applicativeService/logger/service";

@Injectable()
export class OperatorService {

    constructor(private http: HttpClient, private loggerService: LoggerService) {
        this.loggerService = loggerService;
    }

}
