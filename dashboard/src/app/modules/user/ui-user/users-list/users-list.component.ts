import {Component, Input, OnInit} from '@angular/core';
import {User} from '../../../../core/entities/authentication/user';
import {UserService} from '../../../../core/services/authentication/user.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {

  @Input() users: User[];

  constructor(public userService: UserService,
              private toastr: ToastrService) {
  }

  ngOnInit() {
  }

  onDelete(user: User) {
    this.userService.delete(user).subscribe(() => {
      this.toastr.success(`L'utilisateur ${user.firstname} ${user.lastname} a été supprimé`);
    }, err => {
      this.toastr.error(err.message);
    });
  }

  onSendInvitation(user: User) {
    console.log('SEND INVITATION');
  }

}
