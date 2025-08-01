import { CurrentDateComponent } from "./current-date.component";
import { Spectator, createComponentFactory } from "@ngneat/spectator";
import { MockComponent } from "ng-mocks";
import { LoaderComponent } from "../loader/loader.component";
import { CurrentDateService } from "./current-date.service";
import { EMPTY, of, tap, throwError } from "rxjs";
import { DateFormat } from "./current-date.types";

describe("CurrentDateComponent", () => {
  let spectator: Spectator<CurrentDateComponent>;
  let currentDateService: jasmine.SpyObj<CurrentDateService>;

  const createComponent = createComponentFactory({
    component: CurrentDateComponent,
    imports: [
      MockComponent(LoaderComponent), // Ensures child component isn't rendered
    ],
    detectChanges: false, // Let tests handle when to initialize
  });

  beforeEach(() => {
    // Each test should define its own test data by stubbing the relevant spy objects. This avoids
    // cross purpose test data where changing values may break tests elsewhere unexpectedly.
    currentDateService = jasmine.createSpyObj<CurrentDateService>([
      "refreshCurrentDate",
    ]);
    spectator = createComponent({
      providers: [
        { provide: CurrentDateService, useValue: currentDateService },
      ],
    });
  });

  it("should create", () => {
    expect(spectator).toBeTruthy();
  });

  it("should request data only once on load", () => {
    const date = new Date(2025, 2, 19);
    currentDateService.refreshCurrentDate.and.returnValue(of(date));
    spectator.detectChanges();
    expect(currentDateService.refreshCurrentDate).toHaveBeenCalledTimes(1);
  });

  it("should show loading component when observable completes with no items", () => {
    currentDateService.refreshCurrentDate.and.returnValue(EMPTY);
    spectator.detectChanges();

    expectStateDisplayed("loading");
  });

  it("should show loading component before a value is displayed", () => {
    const date = new Date(2025, 2, 19);
    currentDateService.refreshCurrentDate.and.returnValue(
      of(date).pipe(
        tap(() => {
          // Loading component is shown whilst observable has no yet returned
          spectator.detectChanges();
          expectStateDisplayed("loading");
        })
      )
    );

    // Observable returns with data so loading component is hidden and expected date is displayed.
    spectator.detectChanges();
    expectStateDisplayed("data");

    expect(spectator.component.displayDate).toBe("19 Mar 2025, 00:00:00");
  });

  it("should show loading component before new data is requested", () => {
    // We have data already
    const date = new Date(2025, 2, 19);
    currentDateService.refreshCurrentDate.and.returnValue(of(date));
    spectator.detectChanges();
    expectStateDisplayed("data");

    const newDate = new Date(2025, 11, 25);
    currentDateService.refreshCurrentDate.and.returnValue(
      of(newDate).pipe(
        tap(() => {
          // Loading component is shown whilst observable has no yet returned
          spectator.detectChanges();
          expectStateDisplayed("loading");
        })
      )
    );

    // Trigger the event handler
    spectator.triggerEventHandler("button", "click", {});

    spectator.detectChanges();

    expectStateDisplayed("data");
    expect(spectator.component.displayDate).toBe("25 Dec 2025, 00:00:00");
  });

  describe("error state", () => {
    it("should display expected error message if initial load fails", () => {
      currentDateService.refreshCurrentDate.and.returnValue(
        throwError(() => new Error("It broke"))
      );
      spectator.detectChanges();

      expectStateDisplayed("error");
      expect(spectator.component.errorMessage).toBe("It broke");
    });

    it("should display expected error message when no message provided", () => {
      currentDateService.refreshCurrentDate.and.returnValue(
        throwError(() => new Error())
      );
      spectator.detectChanges();

      expectStateDisplayed("error");
      expect(spectator.component.errorMessage).toBe("An error occurred");
    });

    it("should display expected error message when unexpected error object provided", () => {
      currentDateService.refreshCurrentDate.and.returnValue(
        throwError(() => ({
          error: "Something went wrong",
        }))
      );
      spectator.detectChanges();

      expectStateDisplayed("error");
      expect(spectator.component.errorMessage).toBe("An error occurred");
    });

    it("should display expected error message if additional load fails", () => {
      const date = new Date(2025, 2, 19);
      currentDateService.refreshCurrentDate.and.returnValue(of(date));
      spectator.detectChanges();
      expectStateDisplayed("data");

      currentDateService.refreshCurrentDate.and.returnValue(
        throwError(() => new Error("It broke"))
      );

      // Trigger the event handler
      spectator.triggerEventHandler("button", "click", {});

      expectStateDisplayed("error");
      expect(spectator.component.errorMessage).toBe("It broke");
    });
  });

  describe("date format", () => {
    const testDate = new Date(2025, 2, 19, 16, 15, 39);
    const formatTestcases: Record<DateFormat, string> = {
      short: "19/03/2025, 16:15",
      medium: "19 Mar 2025, 16:15:39",
      long: "19 March 2025 at 16:15:39 GMT",
      full: "Wednesday 19 March 2025 at 16:15:39 Greenwich Mean Time",
    };

    Object.keys(formatTestcases).forEach((format) => {
      it(`should show expected format for ${format} format`, () => {
        currentDateService.refreshCurrentDate.and.returnValue(of(testDate));
        spectator.setInput("format", format as DateFormat); // Set input calls ngOnChanges

        const expectedFormat = formatTestcases[format as DateFormat];
        expectStateDisplayed("data");
        expect(spectator.component.displayDate).toBe(expectedFormat);
      });
    });
  });

  function expectStateDisplayed(state: "data" | "error" | "loading") {
    switch (state) {
      case "data":
        expect(spectator.component.displayDate).toBeTruthy();
        expect(spectator.component.errorMessage).toBeFalsy();
        expect(spectator.component.isLoading).toBeFalsy();
        break;

      case "error":
        expect(spectator.component.displayDate).toBeFalsy();
        expect(spectator.component.errorMessage).toBeTruthy();
        expect(spectator.component.isLoading).toBeFalsy();
        break;

      case "loading":
        expect(spectator.component.displayDate).toBeFalsy();
        expect(spectator.component.errorMessage).toBeFalsy();
        expect(spectator.component.isLoading).toBeTruthy();
        break;
    }
  }
});
