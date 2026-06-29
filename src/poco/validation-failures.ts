export type ValidationFailures = {
  fieldFailures: { [key: string]: string };
  gridRowFailures: { [key: string]: GridRowValidationFailures[] };
}

export type GridRowValidationFailures = ValidationFailures & {
  index: number;
  rowValidationMessage: string;
}

export class DragonValidationFailures {
  givenName: string = '';
  weightInKg: string = '';
  lengthInMeters: string = '';
  fightingSkills: string = '';
}

