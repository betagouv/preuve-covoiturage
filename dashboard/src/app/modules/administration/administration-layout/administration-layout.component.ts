import { Component, OnInit } from '@angular/core';

import { MenuTabInterface } from '~/core/interfaces/admin/adminLayoutInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { UserManyRoleEnum } from '~/core/enums/user/user-role.enum';

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
    {
      path: '/admin/users',
      groups: [UserGroupEnum.OPERATOR, UserGroupEnum.TERRITORY],
      role: UserManyRoleEnum.ADMIN,
      label: 'Utilisateurs & accès',
    },
    {
      path: '/admin/all-users',
      groups: [UserGroupEnum.REGISTRY],
      role: UserManyRoleEnum.ADMIN,
      label: 'Utilisateurs & accès',
    },
    {
      path: '/admin/all-territories',
      groups: [UserGroupEnum.REGISTRY],
      role: UserManyRoleEnum.ADMIN,
      label: 'Territoires',
    },
    {
      path: '/admin/all-operators',
      groups: [UserGroupEnum.REGISTRY],
      role: UserManyRoleEnum.ADMIN,
      label: 'Opérateurs',
    },
    {
      path: '/admin/api',
      role: UserManyRoleEnum.ADMIN,
      groups: [UserGroupEnum.OPERATOR],
      label: 'API',
    },
    {
      path: '/admin/visibility',
      role: UserManyRoleEnum.ADMIN,
      groups: [UserGroupEnum.OPERATOR],
      label: 'Visibilité',
    },
  ];

  constructor(public authenticationService: AuthenticationService) {}

  ngOnInit() {}
}
