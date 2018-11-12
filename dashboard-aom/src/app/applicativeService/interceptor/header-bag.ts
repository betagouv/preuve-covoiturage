import { Injectable } from '@angular/core';
import { TokenService	}	from '../token/service';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {map} from "rxjs/operators";

@Injectable()
export class HeaderBag {

  private token:string = null;
  constructor(private tokenService: TokenService, private router: Router ) {
  }

  get(params: any|undefined ): any {
    return [
      { name : 'Authorization' ,  value : 'Bearer ' + this.token },
    ];
  }
  load(): Observable<void> {

    return this.tokenService.get().pipe(map((token: string) => {
      this.token = token;
    }));

  }
}

