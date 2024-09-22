import { ApplicationConfig } from "@angular/core";

import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";

import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideHttpClientTesting(),
  ],
};
