import { Component, OnInit } from '@angular/core';

import { MenuTabInterface } from '~/core/interfaces/admin/adminLayoutInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { UserManyRoleEnum } from '~/core/enums/user/user-role.enum';
import { ConfigService } from '~/core/services/config.service';

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
    {
      path: '/admin/certificates',
      role: UserManyRoleEnum.ADMIN,
      groups: [UserGroupEnum.OPERATOR, UserGroupEnum.REGISTRY],
      label: 'Attestations',
      // feature flag the certificates in production for now
      hideIn: ['production'],
    },
  ];

  constructor(public authenticationService: AuthenticationService, private configService: ConfigService) {}

  ngOnInit(): void {}

  showTab(link: MenuTabInterface): boolean {
    return (
      !this.shouldHide(link) &&
      this.authenticationService.hasAnyGroup(link.groups) &&
      this.authenticationService.hasRole(link.role)
    );
  }

  shouldHide(link: MenuTabInterface): boolean {
    if ('hideIn' in link && link.hideIn.indexOf(this.configService.get('name')) > -1) {
      return true;
    }

    return false;
  }
}
