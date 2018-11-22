import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LoggerService} from "../applicativeService/logger/service";

@Injectable()
export class AomService {

    constructor(private http: HttpClient, private loggerService: LoggerService) {
        this.loggerService = loggerService;
    }

    getCsv() {
        return this.http.get('/proofs/download?format=csv', {responseType: 'blob'});
    }

    getAom() {
        return this.http.get('/aom');
    }
}
