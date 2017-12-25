var moment = require('moment');

var date = moment();

date.add(-1, 'year');
console.log(date.format('MMM Do, YYYY'));


var someTimestamp = moment().valueOf();

var date1 = moment().year(1970).month('Jan').date(1).hour(0).minutes(0).seconds(0);

console.log(someTimestamp);

console.log(date1.format('MMM Do, YYYY HH:MM:SS'));