import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { CurrentDateComponent } from "./app/current-date/current-date.component";
import { LoaderComponent } from "./app/loader/loader.component";

@NgModule({
  declarations: [AppComponent, CurrentDateComponent, LoaderComponent],
  imports: [BrowserModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
