import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegistryLayoutComponent } from '~/modules/registry/registry-layout/registry-layout.component';
import { RegistryRoutingModule } from '~/modules/registry/registry-routing.module';

@NgModule({
  declarations: [RegistryLayoutComponent],
  imports: [CommonModule, RegistryRoutingModule],
})
export class RegistryModule {}
