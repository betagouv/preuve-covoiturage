import { Component, OnInit } from '@angular/core';

import { MenuTabInterface } from '~/core/interfaces/admin/adminLayoutInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

@Component({
  selector: 'app-administration-layout',
  templateUrl: './administration-layout.component.html',
  styleUrls: ['./administration-layout.component.scss'],
})
export class AdministrationLayoutComponent implements OnInit {
  public menu: MenuTabInterface[] = [
    {
      path: '/admin/profile',
      label: 'Votre profil',
    },
    {
      path: '/admin/territory',
      groups: [UserGroupEnum.TERRITORY],
      label: 'Territoire',
    },
    {
      path: '/admin/operator',
      groups: [UserGroupEnum.OPERATOR],
      label: 'Opérateur',
    },
    // {
    //   path: '/admin/users',
    //   groups: ['operator', 'territory'],
    //   role: 'admin',
    //   label: 'Utilisateurs & accès',
    // },
    {
      path: '/admin/all-users',
      groups: [UserGroupEnum.REGISTRY],
      role: 'admin',
      label: 'Utilisateurs & accès',
    },
    {
      path: '/admin/all-territories',
      groups: [UserGroupEnum.REGISTRY],
      role: 'admin',
      label: 'Territoires',
    },
    {
      path: '/admin/api',
      role: 'admin',
      groups: [UserGroupEnum.OPERATOR],
      label: 'API',
    },
  ];

  constructor(public authenticationService: AuthenticationService) {}

  ngOnInit() {}
}
