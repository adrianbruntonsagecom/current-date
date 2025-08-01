import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import { CurrentDateService } from "./current-date.service";
import { DateFormat } from "./current-date.types";

@Component({
  selector: "app-current-date",
  templateUrl: "./current-date.component.html",
  styleUrls: ["./current-date.component.css"]
})
export class CurrentDateComponent implements AfterViewInit {
  @ViewChild("myTitle") myTitle!: ElementRef;

  @Input() format: DateFormat = "medium";

  // Title set by user input - XSS vulnerable example
  dynamicTitle = "<b>This is my local date:</b>";

  isLoading = false;
  displayDate = "";
  errorMessage = "";

  constructor(private currentDateService: CurrentDateService) {}

  ngAfterViewInit() {
    this.setDisplayDate();
    this.updateTitleDisplay();
  }

  updateTitleDisplay() {
    if (this.myTitle) {
      this.myTitle.nativeElement.innerHTML = this.dynamicTitle;
    }
  }

  onInputChange() {
    this.updateTitleDisplay();
  }

  setDisplayDate() {
    this.isLoading = true;
    this.errorMessage = "";
    this.displayDate = "";

    this.currentDateService.refreshCurrentDate().subscribe({
      next: (currentDate) => {
        console.log("Current Date:", currentDate);

        this.isLoading = false;
        this.errorMessage = "";
        this.displayDate = new Intl.DateTimeFormat(navigator.language, {
          dateStyle: this.format,
          timeStyle: this.format,
        }).format(currentDate);
      },
      error: (error) => {
        this.isLoading = false;
        this.displayDate = "";
        this.errorMessage =
          error instanceof Error && error.message
            ? error.message
            : "An error occurred";
      },
    });
  }

  updateDate() {
    this.setDisplayDate();
  }
}
