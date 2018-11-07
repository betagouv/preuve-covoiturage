import { Injectable } from '@angular/core';
import { TokenService	}	from './../token/service';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';

@Injectable()
export class HeaderBag {
  constructor(private tokenService: TokenService, private router: Router ) {
  }
  get(params: any|undefined ): any { // todo: A tester
    return this.tokenService.get().subscribe((token) => {
      return [
        { name : 'Authorization' ,  value : 'Bearer ' + token },
      ];
    });
  }
}

