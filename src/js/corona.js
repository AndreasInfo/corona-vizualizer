//VARIABLES
var myHeight;
var myWidth;
var myArea;
var myPopulation;
var myDensity;
var myPeopleInfected;
var myTimePassed;
var myInterruptionFlag;
var mySpeed;
var myInfectionRate;
var myTime;
var mySteps;
var myBooster;
var myFixedMovement;
var myPeopleHealed;
var myInfectionLimit;
var myIncubationPeriod;
var myMode;
var myPeopleIll;
const myDotRadius = 1;
var myPersons = [];
var myLineGraph;
var myGraphGranularity = 100;
var ctx;
var ctx2;

//CONSTRUCTOR
function Person(id, posX, posY, radius, healthy, infected) {
  this.id = id;
  this.posX = posX;
  this.posY = posY;
  this.radius = radius;
  this.healthy = healthy;
  this.infected = infected;
  this.healed = false;
  this.ill = false;
  this.radiusBuffer = this.radius;
  this.incubation_counter = 0;
  this.infection_counter = 0;
  this.meetings_counter = 0;
}

// FRONTEND-FRONTEND-FRONTEND-FRONTEND-FRONTEND-FRONTEND-FRONTEND-FRONTEND
//enable bootstrap validator
$(document).ready(function () {
  var screenWidth = screen.width;
  var screenHeight = screen.height;

  //limit for screens with width > 1100
  if (screenWidth < 800) {
    //landscape
    if (screenWidth > screenHeight) {
      myWidth = 0.8 * screenWidth;
      myHeight = 0.5 * myWidth;
    }
    //portrait
    else {
      myWidth = 0.8 * screenWidth;
      myHeight = 1.3 * myWidth;
    }
  } else {
    myWidth = 750;
    myHeight = 0.5 * myWidth;
  }
  myArea = (myHeight * myWidth) / 1000000;

  $("#height").val(myHeight.toFixed(2));
  $("#width").val(myWidth.toFixed(2));
  $("#area").val(myArea.toFixed(2));
  $("#density").val(($("#population").val() / myArea).toFixed(2));

  $("#myAnimation").append(
    '<canvas id="myCanvas" width="' +
      myWidth +
      '" height="' +
      myHeight +
      '" style="border:1px solid #000000; display:inline-block;">'
  );
  $("#myGraph").append(
    '<canvas id="myCanvas2" width="' +
      myWidth +
      '" height="' +
      myHeight +
      '" style="border:1px solid #000000; display:inline-block;">'
  );

  ctx = document.getElementById("myCanvas").getContext("2d");
  ctx2 = document.getElementById("myCanvas2").getContext("2d");

  $("#population").change(function () {
    $("#density").val(($("#population").val() / myArea).toFixed(2));
  });

  $('input[value="mode1"]').prop("checked", true);
  $("#incubation_period").prop("disabled", true);

  $('input[name="mode"]').click(function (event) {
    switch (event.target.defaultValue) {
      case "mode1":
        $("#infection_limit").prop("disabled", false);
        $("#incubation_period").prop("disabled", true);
        break;
      case "mode2":
        $("#infection_limit").prop("disabled", true);
        $("#incubation_period").prop("disabled", false);
        break;
      case "mode3":
        $("#infection_limit").prop("disabled", false);
        $("#incubation_period").prop("disabled", false);
      default:
    }
  });
  //$('input[value="mode2"]').prop("disabled", true);
});

$("#myForm").submit(function (event) {
  event.preventDefault();
  myPopulation = $("#population").val();
  mySpeed = translateSpeed($("#speed").val());
  myInfectionRate = $("#infection_rate").val();
  myInfectionLimit = $("#infection_limit").val();
  myTime = $("#time").val();
  mySteps = $("#steps").val();
  myBooster = $("#booster").prop("checked");
  myFixedMovement = $("#fixed_movement").prop("checked");
  myMode = $('input[name="mode"]:checked').val();
  myIncubationPeriod = $("#incubation_period").val();

  console.log("myPopulation: " + myPopulation);
  console.log("mySpeed: " + mySpeed);
  console.log("myInfectionRate: " + myInfectionRate);
  console.log("myInfectionLimit: " + myInfectionLimit);
  console.log("myTime: " + myTime);
  console.log("mySteps: " + mySteps);
  console.log("myBooster: " + myBooster);
  console.log("myFixedMovement: " + myFixedMovement);
  console.log("myMode: " + myMode);
  console.log("myIncubationPeriod: " + myIncubationPeriod);

  createThis();
  myInterruptionFlag = false;
  myTimePassed = 0;
  myPeopleInfected = 1;
  myPeopleHealed = 0;
  myPeopleIll = 0;
  moveThis();
  $("#submit_this").prop("disabled", true);
});

$("#reset_this").click(function () {
  event.preventDefault();
  myInterruptionFlag = true;
  deleteThis();
  $("#submit_this").prop("disabled", false);
});

// BACKEND-BACKEND-BACKEND-BACKEND-BACKEND-BACKEND-BACKEND-BACKEND
//helper functions
function getRandomIntInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//5=50, 4=175, 3=300, 2=500, 1=1000
function translateSpeed(input) {
  switch (input) {
    case "1":
      return 1000;
    case "2":
      return 500;
    case "3":
      return 300;
    case "4":
      return 175;
    case "5":
      return 50;
  }
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
    intervals.push(min + i * base);
    intervals.push(min + base - 1 + i * base);
  }

  for (var i = 1; i < (rest + 1) * 2; i += 2) {
    for (var j = i; j < n * 2; j++) {
      intervals[j] = intervals[j] + 1;
    }
  }

  var intervalsArray = [];

  for (var i = 0; i < n * 2; i += 2) {
    intervalsArray.push(new Array(intervals[i], intervals[i + 1]));
  }

  return intervalsArray;
}

//create array
function createThis() {
  if (!myFixedMovement) {
    // patient zero
    myPersons.push(
      new Person(
        "id0",
        getRandomIntInRange(0, myWidth),
        getRandomIntInRange(0, myHeight),
        getRandomIntInRange(1, mySteps),
        false,
        true
      )
    );
    // rest of population
    for (var i = 1; i < myPopulation; i++) {
      myPersons.push(
        new Person(
          "id" + i,
          getRandomIntInRange(0, myWidth),
          getRandomIntInRange(0, myHeight),
          getRandomIntInRange(1, mySteps),
          true,
          false
        )
      );
    }
  } else {
    // patient zero
    myPersons.push(
      new Person(
        "id0",
        getRandomIntInRange(0, myWidth),
        getRandomIntInRange(0, myHeight),
        mySteps,
        false,
        true
      )
    );
    // rest of population
    for (var i = 1; i < myPopulation; i++) {
      myPersons.push(
        new Person(
          "id" + i,
          getRandomIntInRange(0, myWidth),
          getRandomIntInRange(0, myHeight),
          mySteps,
          true,
          false
        )
      );
    }
  }
  if (myBooster) {
    // patient zero
    if (Math.random() < 0.05 ? true : false) {
      myPersons[0].radius *= Math.random() < 0.5 ? 2 : 3;
    }
    // rest of population
    for (var i = 1; i < myPopulation; i++) {
      if (Math.random() < 0.05 ? true : false) {
        myPersons[i].radius *= Math.random() < 0.5 ? 2 : 3;
      }
    }
  }
}

async function moveThis() {
  for (var i = 0; i < myTime; i++) {
    if (myInterruptionFlag) {
      break;
    }

    moveThisOneStep(); //aprox 10ms with 50.000
    switch (myMode) {
      case "mode1":
        mode1();
        break;
      case "mode2":
        mode2();
        break;
      case "mode3":
        mode3();
        break;
      default:
    }
    drawThis(); //aprox 130ms with 50.000

    if (i == 0) {
      if (myLineGraph != undefined) {
        myLineGraph.destroy();
      }
      drawGraph();
      var myGraphCounter = 0;
    }

    if (myTimePassed % (myTime / myGraphGranularity) == 0) {
      myGraphCounter++;
      updateGraph(myGraphCounter);
    }

    /*
		//testing area for performance
		var date1 = new Date().getTime();
		drawThis(); //aprox 130ms with 50.000
		var date2 = new Date().getTime();
		console.log(date1 - date2);
		*/

    $("#people_infected").text(myPeopleInfected);
    $("#people_healed").text(myPeopleHealed);
    $("#people_ill").text(myPeopleIll);
    $("#infections_total").text(
      myPeopleInfected + myPeopleIll + myPeopleHealed
    );
    $("#time_passed").text(myTimePassed);

    if (myTimePassed == myTime) {
      myInterruptionFlag = true;
      $(".modal-title").html("Time is up!!!");
      $(".modal-body").html("Please try again...");
      $("#modal").modal("show");
    }
    /*
		if (myPeopleInfected + myPeopleIll == 0) {
			myInterruptionFlag = true;
			$(".modal-title").html("No more contagious people!!!");
			$(".modal-body").html("Please try again...");
			$("#modal").modal('show');
		}
		if (myPeopleInfected + myPeopleIll + myPeopleHealed == myPopulation) {
			myInterruptionFlag = true;
			$(".modal-title").html("No more people to infect!!!");
			$(".modal-body").html("Please try again...");
			$("#modal").modal('show');
		}
		*/
    await sleep(mySpeed);
  }
}

function moveThisOneStep() {
  for (var i = 0; i < myPopulation; i++) {
    myPersons[i].posX += (Math.random() < 0.5 ? -1 : 1) * myPersons[i].radius;
    if (myPersons[i].posX > myWidth) {
      myPersons[i].posX = myPersons[i].posX % myWidth;
    }
    if (myPersons[i].posX < 0) {
      myPersons[i].posX = myWidth + (myPersons[i].posX % myWidth);
    }
    myPersons[i].posY += (Math.random() < 0.5 ? -1 : 1) * myPersons[i].radius;
    if (myPersons[i].posY > myHeight) {
      myPersons[i].posY = myPersons[i].posY % myHeight;
    }
    if (myPersons[i].posY < 0) {
      myPersons[i].posY = myHeight + (myPersons[i].posY % myHeight);
    }
  }
  //sort on x-values, uses merge-sort
  myPersons.sort(function (a, b) {
    return a.posX - b.posX;
  });
  myTimePassed++;
}

function mode1() {
  var i;
  var c;

  /*algorithm looping through array:
	(1) for-loop through sorted (x-values) array with all people (counter i);
		(2) while-loop search for people behind i (counter c --> next person is ((i + c) % myPopulation) with x-values within range;
		take care of border cases on x-axis with;
		when c finds first out of range, then go to next i;
			(3) compare if y-axis wihtin range;
			take care of border cases on y-axis;
			if yes, do logic;
			if no, nothing;
			go to next c;
	*/
  for (i = 0; i < myPopulation; i++) {
    c = 1;
    //while (myPersons[i].posX == myPersons[(i + c) % myPopulation].posX) {
    //if (myPersons[i].posX == myPersons[(i + c) % myPopulation].posX) {
    while (
      Math.abs(myPersons[i].posX - myPersons[(i + c) % myPopulation].posX) <=
        2 * myDotRadius ||
      Math.abs(myPersons[i].posX - myPersons[(i + c) % myPopulation].posX) >=
        myWidth - 2 * myDotRadius
    ) {
      if (
        Math.abs(myPersons[i].posY - myPersons[(i + c) % myPopulation].posY) <=
          2 * myDotRadius ||
        Math.abs(myPersons[i].posY - myPersons[(i + c) % myPopulation].posY) >=
          myHeight - 2 * myDotRadius
      ) {
        /*algorithm healthy-infected-healed:
				healthy - healthy	--> nothing
				healthy - healed	--> nothing
				healthy - infected	--> infection inkl. counter++ (case 2)
				infected - healthy	--> infection inkl. counter++ (case 1)
				infected - healed	--> counter++ (case 4)
				infected - infected	--> counter++ counter++ (case 3)
				healed - healthy	--> nothing
				healed - healed		--> nothing
				healed - infected	--> counter++ (case 5)
				*/
        if (
          myPersons[i].infected &&
          myPersons[(i + c) % myPopulation].healthy
        ) {
          if (myPersons[i].meetings_counter == myInfectionRate) {
            myPersons[(i + c) % myPopulation].healthy = false;
            myPersons[(i + c) % myPopulation].infected = true;
            myPeopleInfected++;
            myPersons[i].meetings_counter = 0;

            myPersons[i].infection_counter++;
            if (myPersons[i].infection_counter == myInfectionLimit) {
              myPersons[i].infected = false;
              myPersons[i].healed = true;
              myPeopleInfected--;
              myPeopleHealed++;
            }
          } else {
            myPersons[i].meetings_counter++;
          }
        } else if (
          myPersons[i].healthy &&
          myPersons[(i + c) % myPopulation].infected
        ) {
          if (
            myPersons[(i + c) % myPopulation].meetings_counter ==
            myInfectionRate
          ) {
            myPersons[i].healthy = false;
            myPersons[i].infected = true;
            myPeopleInfected++;
            myPersons[(i + c) % myPopulation].meetings_counter = 0;

            myPersons[(i + c) % myPopulation].infection_counter++;
            if (
              myPersons[(i + c) % myPopulation].infection_counter ==
              myInfectionLimit
            ) {
              myPersons[(i + c) % myPopulation].infected = false;
              myPersons[(i + c) % myPopulation].healed = true;
              myPeopleInfected--;
              myPeopleHealed++;
            }
          } else {
            myPersons[(i + c) % myPopulation].meetings_counter++;
          }
        } else if (
          myPersons[i].infected &&
          myPersons[(i + c) % myPopulation].infected
        ) {
          myPersons[i].meetings_counter == myInfectionRate
            ? (myPersons[i].meetings_counter = 0)
            : myPersons[i].meetings_counter++;
          myPersons[(i + c) % myPopulation].meetings_counter == myInfectionRate
            ? (myPersons[(i + c) % myPopulation].meetings_counter = 0)
            : myPersons[(i + c) % myPopulation].meetings_counter++;
        } else if (
          myPersons[i].infected &&
          myPersons[(i + c) % myPopulation].healed
        ) {
          myPersons[i].meetings_counter == myInfectionRate
            ? (myPersons[i].meetings_counter = 0)
            : myPersons[i].meetings_counter++;
        } else if (
          myPersons[i].healed &&
          myPersons[(i + c) % myPopulation].infected
        ) {
          myPersons[(i + c) % myPopulation].meetings_counter == myInfectionRate
            ? (myPersons[(i + c) % myPopulation].meetings_counter = 0)
            : myPersons[(i + c) % myPopulation].meetings_counter++;
        }
      }
      c++;
      /*
			if (i + c == myPopulation) {
				break;
			}
			*/
    }
  }
}

function mode2() {
  var i;
  var c;

  for (i = 0; i < myPopulation; i++) {
    if (myPersons[i].infected || myPersons[i].ill) {
      myPersons[i].incubation_counter++;
      //console.log(myPersons.find(element => element.id == "id0"));
      if (myPersons[i].incubation_counter == myIncubationPeriod) {
        myPersons[i].infected = false;
        myPersons[i].ill = true;
        myPersons[i].radius = 0;
        myPeopleInfected--;
        myPeopleIll++;
      }
      if (
        myPersons[i].incubation_counter == Math.round(myIncubationPeriod * 1.5)
      ) {
        myPersons[i].ill = false;
        myPersons[i].healed = true;
        myPersons[i].radius = myPersons[i].radiusBuffer;
        myPeopleIll--;
        myPeopleHealed++;
      }
    }
  }

  for (i = 0; i < myPopulation; i++) {
    c = 1;
    while (
      Math.abs(myPersons[i].posX - myPersons[(i + c) % myPopulation].posX) <=
        2 * myDotRadius ||
      Math.abs(myPersons[i].posX - myPersons[(i + c) % myPopulation].posX) >=
        myWidth - 2 * myDotRadius
    ) {
      if (
        Math.abs(myPersons[i].posY - myPersons[(i + c) % myPopulation].posY) <=
          2 * myDotRadius ||
        Math.abs(myPersons[i].posY - myPersons[(i + c) % myPopulation].posY) >=
          myHeight - 2 * myDotRadius
      ) {
        /*algorithm healthy-infected-ill-healed:
				healthy - healthy	--> nothing
				healthy - healed	--> nothing
				healthy - infected	--> infection inkl. counter++ (case 2)
				healthy - ill		--> CASE 2
				infected - healthy	--> infection inkl. counter++ (case 1)
				infected - healed	--> counter++ (case 4)
				infected - infected	--> counter++ counter++ (case 3)
				infected - ill		--> CASE 3
				healed - healthy	--> nothing
				healed - healed		--> nothing
				healed - infected	--> counter++ (case 5)
				healed - ill		--> CASE 5
				ill - healhty		--> CASE 1
				ill - healed		--> CASE 4
				ill - infected		--> CASE 3
				ill - ill			--> CASE 3
				*/
        if (
          (myPersons[i].infected || myPersons[i].ill) &&
          myPersons[(i + c) % myPopulation].healthy
        ) {
          if (myPersons[i].meetings_counter == myInfectionRate) {
            myPersons[(i + c) % myPopulation].healthy = false;
            myPersons[(i + c) % myPopulation].infected = true;
            myPeopleInfected++;
            myPersons[i].meetings_counter = 0;
          } else {
            myPersons[i].meetings_counter++;
          }
        } else if (
          myPersons[i].healthy &&
          (myPersons[(i + c) % myPopulation].infected ||
            myPersons[(i + c) % myPopulation].ill)
        ) {
          if (
            myPersons[(i + c) % myPopulation].meetings_counter ==
            myInfectionRate
          ) {
            myPersons[i].healthy = false;
            myPersons[i].infected = true;
            myPeopleInfected++;
            myPersons[(i + c) % myPopulation].meetings_counter = 0;
          } else {
            myPersons[(i + c) % myPopulation].meetings_counter++;
          }
        } else if (
          (myPersons[i].infected || myPersons[i].ill) &&
          (myPersons[(i + c) % myPopulation].infected ||
            myPersons[(i + c) % myPopulation].ill)
        ) {
          myPersons[i].meetings_counter == myInfectionRate
            ? (myPersons[i].meetings_counter = 0)
            : myPersons[i].meetings_counter++;
          myPersons[(i + c) % myPopulation].meetings_counter == myInfectionRate
            ? (myPersons[(i + c) % myPopulation].meetings_counter = 0)
            : myPersons[(i + c) % myPopulation].meetings_counter++;
        } else if (
          (myPersons[i].infected || myPersons[i].ill) &&
          myPersons[(i + c) % myPopulation].healed
        ) {
          myPersons[i].meetings_counter == myInfectionRate
            ? (myPersons[i].meetings_counter = 0)
            : myPersons[i].meetings_counter++;
        } else if (
          myPersons[i].healed &&
          (myPersons[(i + c) % myPopulation].infected ||
            myPersons[(i + c) % myPopulation].ill)
        ) {
          myPersons[(i + c) % myPopulation].meetings_counter == myInfectionRate
            ? (myPersons[(i + c) % myPopulation].meetings_counter = 0)
            : myPersons[(i + c) % myPopulation].meetings_counter++;
        }
      }
      c++;
    }
  }
}

function mode3() {
  var i;
  var c;

  for (i = 0; i < myPopulation; i++) {
    if (myPersons[i].infected || myPersons[i].ill) {
      myPersons[i].incubation_counter++;
      if (myPersons[i].incubation_counter == myIncubationPeriod) {
        myPersons[i].infected = false;
        myPersons[i].ill = true;
        myPersons[i].radius = 0;
        myPeopleInfected--;
        myPeopleIll++;
      }
      if (
        myPersons[i].incubation_counter == Math.round(myIncubationPeriod * 1.5)
      ) {
        myPersons[i].ill = false;
        myPersons[i].healed = true;
        myPersons[i].radius = myPersons[i].radiusBuffer;
        myPeopleIll--;
        myPeopleHealed++;
      }
    }
  }

  for (i = 0; i < myPopulation; i++) {
    c = 1;
    while (
      Math.abs(myPersons[i].posX - myPersons[(i + c) % myPopulation].posX) <=
        2 * myDotRadius ||
      Math.abs(myPersons[i].posX - myPersons[(i + c) % myPopulation].posX) >=
        myWidth - 2 * myDotRadius
    ) {
      if (
        Math.abs(myPersons[i].posY - myPersons[(i + c) % myPopulation].posY) <=
          2 * myDotRadius ||
        Math.abs(myPersons[i].posY - myPersons[(i + c) % myPopulation].posY) >=
          myHeight - 2 * myDotRadius
      ) {
        if (
          (myPersons[i].infected || myPersons[i].ill) &&
          myPersons[(i + c) % myPopulation].healthy
        ) {
          if (myPersons[i].meetings_counter == myInfectionRate) {
            myPersons[(i + c) % myPopulation].healthy = false;
            myPersons[(i + c) % myPopulation].infected = true;
            myPeopleInfected++;
            myPersons[i].meetings_counter = 0;

            myPersons[i].infection_counter++;
            if (myPersons[i].infection_counter == myInfectionLimit) {
              if (myPersons[i].infected) {
                myPersons[i].infected = false;
                myPersons[i].healed = true;
                myPeopleInfected--;
                myPeopleHealed++;
              }
              if (myPersons[i].ill) {
                myPersons[i].ill = false;
                myPersons[i].healed = true;
                myPersons[i].radius = myPersons[i].radiusBuffer;
                myPeopleIll--;
                myPeopleHealed++;
              }
            }
          } else {
            myPersons[i].meetings_counter++;
          }
        } else if (
          myPersons[i].healthy &&
          (myPersons[(i + c) % myPopulation].infected ||
            myPersons[(i + c) % myPopulation].ill)
        ) {
          if (
            myPersons[(i + c) % myPopulation].meetings_counter ==
            myInfectionRate
          ) {
            myPersons[i].healthy = false;
            myPersons[i].infected = true;
            myPeopleInfected++;
            myPersons[(i + c) % myPopulation].meetings_counter = 0;

            myPersons[(i + c) % myPopulation].infection_counter++;
            if (
              myPersons[(i + c) % myPopulation].infection_counter ==
              myInfectionLimit
            ) {
              if (myPersons[(i + c) % myPopulation].infected) {
                myPersons[(i + c) % myPopulation].infected = false;
                myPersons[(i + c) % myPopulation].healed = true;
                myPeopleInfected--;
                myPeopleHealed++;
              }
              if (myPersons[(i + c) % myPopulation].ill) {
                myPersons[(i + c) % myPopulation].ill = false;
                myPersons[(i + c) % myPopulation].healed = true;
                myPersons[(i + c) % myPopulation].radius =
                  myPersons[(i + c) % myPopulation].radiusBuffer;
                myPeopleIll--;
                myPeopleHealed++;
              }
            }
          } else {
            myPersons[(i + c) % myPopulation].meetings_counter++;
          }
        } else if (
          (myPersons[i].infected || myPersons[i].ill) &&
          (myPersons[(i + c) % myPopulation].infected ||
            myPersons[(i + c) % myPopulation].ill)
        ) {
          myPersons[i].meetings_counter == myInfectionRate
            ? (myPersons[i].meetings_counter = 0)
            : myPersons[i].meetings_counter++;
          myPersons[(i + c) % myPopulation].meetings_counter == myInfectionRate
            ? (myPersons[(i + c) % myPopulation].meetings_counter = 0)
            : myPersons[(i + c) % myPopulation].meetings_counter++;
        } else if (
          (myPersons[i].infected || myPersons[i].ill) &&
          myPersons[(i + c) % myPopulation].healed
        ) {
          myPersons[i].meetings_counter == myInfectionRate
            ? (myPersons[i].meetings_counter = 0)
            : myPersons[i].meetings_counter++;
        } else if (
          myPersons[i].healed &&
          (myPersons[(i + c) % myPopulation].infected ||
            myPersons[(i + c) % myPopulation].ill)
        ) {
          myPersons[(i + c) % myPopulation].meetings_counter == myInfectionRate
            ? (myPersons[(i + c) % myPopulation].meetings_counter = 0)
            : myPersons[(i + c) % myPopulation].meetings_counter++;
        }
      }
      c++;
    }
  }
}

//clear canvas and draw myPersons new
function drawThis() {
  ctx.clearRect(0, 0, myWidth, myHeight);

  for (var i = 0; i < myPopulation; i++) {
    ctx.beginPath();
    if (myPersons[i].infected) {
      ctx.fillStyle = "#FF0000";
    } else if (myPersons[i].ill) {
      ctx.fillStyle = "#FFA500";
    } else if (myPersons[i].healed) {
      ctx.fillStyle = "#32CD32";
    } else {
      ctx.fillStyle = "#000000";
    }
    //ctx.fillRect(myPersons[i].posX, myPersons[i].posY, 3, 3);
    ctx.arc(myPersons[i].posX, myPersons[i].posY, 2, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function drawGraph() {
  //global configuration options...
  Chart.defaults.global.responsive = false;
  Chart.defaults.global.animation.duration = 0; // general animation time
  Chart.defaults.global.elements.line.tension = 0; // disables bezier curves

  myLineGraph = new Chart(ctx2, {
    type: "line",
    data: {
      labels: [0],
      datasets: [
        {
          data: [myPeopleInfected],
          label: "infected",
          borderColor: "#FF0000",
          fill: true,
        },
        {
          data: [myPeopleIll],
          label: "ill",
          borderColor: "#FFA500",
          fill: true,
        },
        {
          data: [myPeopleInfected],
          label: "healed",
          borderColor: "#32CD32",
          fill: true,
        },
        {
          data: [myPeopleInfected + myPeopleIll + myPeopleHealed],
          label: "infections (total)",
          borderColor: "#D3D3D3",
          fill: true,
        },
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            scaleLabel: {
              labelString: "population [people]",
              display: true,
            },
            ticks: {
              beginAtZero: true,
              suggestedMin: 0,
              suggestedMax: myPopulation,
            },
          },
        ],
        xAxes: [
          {
            scaleLabel: {
              labelString: "time [steps]",
              display: true,
            },
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });
}

function updateGraph(counter) {
  myLineGraph.data.labels.push(counter * (myTime / myGraphGranularity));
  myLineGraph.data.datasets[0].data.push(myPeopleInfected);
  myLineGraph.data.datasets[1].data.push(myPeopleIll);
  myLineGraph.data.datasets[2].data.push(myPeopleHealed);
  myLineGraph.data.datasets[3].data.push(
    myPeopleInfected + myPeopleIll + myPeopleHealed
  );
  myLineGraph.update();
}

function deleteThis() {
  for (var i = 0; i < myPopulation; i++) {
    myPersons.pop();
  }
}

//DEVELOP - DEVELOP - DEVELOP - DEVELOP - DEVELOP - DEVELOP - DEVELOP - DEVELOP - DEVELOP - DEVELOP - DEVELOP - DEVELOP - DEVELOP -

//use concurrency and divide the task by 8 to support 8 cores
async function drawThisFast(cores) {
  ctx.clearRect(0, 0, myWidth, myHeight);
  var myIntervals = divideRangeInNParts(0, myPopulation, cores);

  const prom0 = drawThisPromise(myIntervals[0][0], myIntervals[0][1]);
  const prom1 = drawThisPromise(myIntervals[1][0], myIntervals[1][1]);
  const prom2 = drawThisPromise(myIntervals[2][0], myIntervals[2][1]);
  const prom3 = drawThisPromise(myIntervals[3][0], myIntervals[3][1]);
  const prom4 = drawThisPromise(myIntervals[4][0], myIntervals[4][1]);
  const prom5 = drawThisPromise(myIntervals[5][0], myIntervals[5][1]);
  const prom6 = drawThisPromise(myIntervals[6][0], myIntervals[6][1]);
  const prom7 = drawThisPromise(myIntervals[7][0], myIntervals[7][1]);

  Promise.all([prom0, prom1, prom2, prom3, prom4, prom5, prom6, prom7]).then(
    console.log("huhu")
  );
}

function drawThisPromise(min, max) {
  return new Promise((resolve) => {
    for (var i = min; i < max; i++) {
      ctx.beginPath();
      ctx.rect(myPersons[i].posX, myPersons[i].posY, 2, 2);
      //ctx.arc(myPersons[i].posX, myPersons[i].posY, 2, 0, 2 * Math.PI);
      if (myPersons[i].infected) {
        ctx.fillStyle = "#FF0000";
      } else {
        ctx.fillStyle = "#000000";
      }
      ctx.fill();
    }
    resolve();
  });
}
