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

export class HoursWorkedValidationFailures {
  startDateTimeUnix: string = '';
  endDateTimeUnix: string = '';
}

export class PayPeriodValidationFailures {
  startDateUnix: string = '';
  endDateUnix: string = '';
  hoursWorkedStartDateTimeUnix: string = '';
  hoursWorkedEndDateTimeUnix: string = '';
}
