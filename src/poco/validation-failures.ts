export type ValidationFailures = {
  fieldFailures: { [key: string]: string };
}

export type GridRowValidationFailures = {
  index: number;
  rowValidationMessage: string;
}

export class DragonValidationFailures {
  givenName: string = '';
  weightInKg: string = '';
  lengthInMeters: string = '';
  fightingSkills: string = '';
}

export type HoursWorkedValidationFailures = GridRowValidationFailures & {
  startDateTime: string;
  endDateTime: string;
}

export class PayPeriodValidationFailuresNew {
  startDate: string = '';
  endDate: string = '';
  hoursWorked: HoursWorkedValidationFailures[] = [];
}
