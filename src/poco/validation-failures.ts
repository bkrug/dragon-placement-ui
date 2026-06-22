export class DragonValidationFailures {
  givenName: string = '';
  weightInKg: string = '';
  lengthInMeters: string = '';
  fightingSkills: string = '';
}

export class JobValidationFailures {
  jobTitle: string = '';
  numberOfPositions: string = '';
}

export class PayPeriodValidationFailures {
  startDateUnix: string = '';
  endDateUnix: string = '';
  hoursWorkedStartDateTimeUnix: string = '';
  hoursWorkedEndDateTimeUnix: string = '';
}

export class HoursWorkedValidationFailures {
  index: number = -1;
  startDateTime: string = '';
  endDateTime: string = '';
}

export class PayPeriodValidationFailuresNew {
  startDate: string = '';
  endDate: string = '';
  hoursWorked: HoursWorkedValidationFailures[] = [];
}
