import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Injectable({ providedIn: "root" })
export class CurrentDateService {
  private MAX_DELAY = 3000;

  private currentDate: Subject<Date> = new Subject<Date>();
  public currentDate$ = this.currentDate.asObservable();

  /**
   * Mimics contacting an API to return the current date time.
   */
  public refreshCurrentDate(): Observable<Date> {
    const delay = Math.floor(Math.random() * this.MAX_DELAY);
    setTimeout(() => {
      this.currentDate.next(new Date());
    }, delay);

    return this.currentDate$;
  }
}
