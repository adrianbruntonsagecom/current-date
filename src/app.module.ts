import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { CurrentDateComponent } from "./app/current-date/current-date.component";
import { LoaderComponent } from "./app/loader/loader.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [AppComponent, LoaderComponent, CurrentDateComponent],
  imports: [BrowserModule, CommonModule, FormsModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
