import * as moment from 'moment';


export const Age = {
  toBirthYear: (age: number) => moment().year() - age,

  listToSortedBirthYear: (ages: number[]) => ages.map(Age.toBirthYear).sort(),
};
