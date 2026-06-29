export type ValidationFailures = {
  fieldFailures: { [key: string]: string };
}

export class GridRowValidationFailures {
  index: number = -1;
  rowValidationMessage: string = '';
}

export class DragonValidationFailures {
  givenName: string = '';
  weightInKg: string = '';
  lengthInMeters: string = '';
  fightingSkills: string = '';
}

export class HoursWorkedValidationFailures extends GridRowValidationFailures {
  startDateTime: string = '';
  endDateTime: string = '';
}

export class PayPeriodValidationFailuresNew {
  startDate: string = '';
  endDate: string = '';
  hoursWorked: HoursWorkedValidationFailures[] = [];
}
