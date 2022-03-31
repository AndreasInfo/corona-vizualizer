function posNr() {
	return Math.round((Math.random() * 10));
}

function negNr() {
	return (-1) * Math.round((Math.random() * 10));
}

function moduloNumber(x, y) {
	return x % y;
}

function getRandomInt(min, max) {
	return Math.floor((Math.random() * (max - min + 1)) + min);
}

function divideRangeInNParts(min, max, n) {
	var diff = max - min;
	var base = Math.floor(diff / n);
	var rest = diff % n;

	//error for more requested parts than buildable with integers
	if (diff < n - 1) {
		console.log("ERROR: diff>(n-1) in divideRangeInNParts");
		return;
	}

	var intervals = [];

	for (var i = 0; i < n; i++) {
		intervals.push(min + (i * base));
		intervals.push((min + base - 1) + (i * base));
	}

	for (var i = 1; i < (rest + 1) * 2; i += 2) {
		for (var j = i; j < n * 2; j++) {
			intervals[j] = intervals[j] + 1;
		}
	}

	var intervalsArray = [];

	for (var i = 0; i < n * 2; i += 2) {
		intervalsArray.push(new Array(intervals[i], intervals[i + 1]))
	}

	return intervalsArray;
}

//(myPersons[i].posX - myPersons[(i + c) % myPopulation].posX < -2)
var posX = 0;
var posY = 0;
console.log(0-0 > -2);
console.log(0-1 > -2);
console.log(0-2 > -2);
console.log(0-3 > -2);

