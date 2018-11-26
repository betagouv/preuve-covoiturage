import { Component , Injectable, OnInit } from '@angular/core';
import {AuthenticationService} from "../../applicativeService/authentication/service";


@Component({
  selector : 'app-header',
  templateUrl : 'template.html',
  styleUrls : ['style.scss']
})

@Injectable()
export class HeaderComponent implements OnInit {
  constructor(
      private authenticationService: AuthenticationService,
  ) {}
  ngOnInit() {}

  logOut() {
    this.authenticationService.logout(true);
  }

}