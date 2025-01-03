import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicStorageModule } from '@ionic/storage';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Network } from '@ionic-native/network/ngx';
import { SwiperModule} from 'swiper/angular'
import { Camera } from '@ionic-native/camera/ngx';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicSelectableModule } from 'ionic-selectable';
import { GlobalErrorHandler } from './shared/handler/error.handler';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    SwiperModule,
    IonicModule.forRoot({
      mode: 'ios'
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      }
    }),
    AppRoutingModule,
    HttpClientModule,
    IonicSelectableModule,
    IonicStorageModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js',
      {
        enabled: environment.production,
        // Register the ServiceWorker as soon as the app is stable
        // or after 30 seconds (whichever comes first).
        // registrationStrategy: 'registerWhenStable:30000'
      })],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    Network,
    Camera
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
