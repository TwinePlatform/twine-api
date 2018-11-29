import * as moment from 'moment';

const rndInt = (max: number, min = 0) =>
  Math.round((max - min) * Math.random() + min);

export const rndPastDateThisMonth = () =>
  moment()
    .startOf('month')
    .add(rndInt(moment().date() - 1), 'days')
    .add(rndInt(23), 'hours')
    .add(rndInt(59), 'minutes')
    .add(rndInt(59), 'seconds')
    .add(rndInt(999), 'milliseconds');

