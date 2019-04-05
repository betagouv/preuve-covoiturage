/* Angular imports */
import { NgModule } from '@angular/core';

/* External modules */

/* Shared modules */
import { GraphicModule } from '~/shared/graphic/graphic.module';

/* Local modules */
import { HomeRoutingModule } from './home.routing';

/* Local components */
import { HomeComponent } from './pages/home/component';
import { OperatorHomePageComponent } from './components/homepages/operator/component';
import { AomHomePageComponent } from './components/homepages/aom/component';
import { RegistryHomePageComponent } from './components/homepages/registry/component';
import { HomePageImgComponent } from './components/img/component';
import { HomePageInformationComponent } from './components/information/component';
import { HomePageTitleComponent } from './components/title/component';


/* Local services */


@NgModule({
  imports: [
    HomeRoutingModule,
    GraphicModule,
  ],
  providers: [
  ],
  declarations: [
    // home page
    HomeComponent,

    // specific home pages
    OperatorHomePageComponent,
    AomHomePageComponent,
    RegistryHomePageComponent,

    // shared homepage parts
    HomePageImgComponent,
    HomePageInformationComponent,
    HomePageTitleComponent,
  ],
  exports: [
  ],
})
export class HomeModule { }
