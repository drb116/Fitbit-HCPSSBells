import clock from "clock";
import document from "document";
import { today, goals } from "user-activity";
import { display } from 'display';
import * as messaging from "messaging";
import * as util from "./util";
import * as fs from "fs";

const SETTINGS_TYPE = "json";
const SETTINGS_FILE = "settings.json";

// Update the clock every second
clock.granularity = "seconds";

//Read settings from file
let settings = loadSettings();
var option = settings.timeOption;
var lunchOption = settings.lunchOption;

// Get a handle on the <text> element
let countDownLabel = document.getElementById("countDownLabel");
let timeLabel = document.getElementById("timeLabel");
let periodLabel = document.getElementById("periodLabel");
let stepLabel = document.getElementById("stepLabel");
let activeLabel = document.getElementById("activeLabel");
let hourlyLabel = document.getElementById("hourlyLabel");
//var hourlySteps = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

function getPeriod(timeDouble){ //removed option
  //Find the time and compare it to periods
  //convert time to decimal for comparison
  //i.e. 10:20 equals 10.20
  let periodTimes;
  if (option==0) {
  periodTimes = [0.0,8.15,9.10,10.10,12.15,13.10,14.10];
  }
  else if (option ==1) { //Beartime
  periodTimes = [0.0,8.10,9.00,10.25,12.30,13.20,14.10];
  }
  else if (option ==2) { //3 Hour Early
  periodTimes = [0.0,7.55,8.30,9.10,10.00,10.35,11.10];
  }
  else if (option ==3) { //2 Hour Delay
  periodTimes = [0.0,9.55,10.30,11.05,13.10,13.40,14.10];
  }
  else if (option==4) { //normal
    periodTimes = [0.0,0.0,0.0,0.0,0.0,0.0,0.0];
  }
  else if (option==5) { //special
    periodTimes = [0.0,8.05,8.45,9.25,10.05,12.10,12.50];
  }
  var currentPeriod = 1;
  while (timeDouble >= periodTimes[currentPeriod]){
    currentPeriod ++;
  }
  
  return currentPeriod;
}

function findNextEnd(period) {//removed option
  //option 0 - Normal day
  let secondsRemain = [
    [0,29700,33000,36600,44100,47400,51000],//Normal bell
    [0,29400,32400,37500,45000,48000,51000],//Bear Time
    [0,28500,30600,33000,36000,38100,40200],//3 Hour Early Dismissal
    [0,35700,37800,39900,47400,49200,51000],//Two hour delay
    [0,35580,37560,48900,56400,58200,79800],//For normal time, valueswill be ignored
    [0,29100,31500,33900,36300,43800,46200]] //test
  
    return secondsRemain[option][period];
}


function updateCountdown() {
  let tday = new Date();
  let hours = tday.getHours();
  let minutes = tday.getMinutes();
  let seconds = tday.getSeconds();
  let mon = tday.getMonth();
  let day = tday.getDay();
  
  let monthArray = ["JAN","FEB","MAR","APR","MAY","JUN","JUL",
                    "AUG","SEP","OCT","NOV","DEC"];
  let month = monthArray[mon];
  //let hourlyCount = updateHourlyActive(hours);
  let timeInSeconds = 3600*hours + 60*minutes + seconds;
    
  let currentPeriod = getPeriod(hours + minutes/100,option);
  let nextEnd = findNextEnd(currentPeriod, option); 
  let timeToEnd = nextEnd - timeInSeconds;
  let periodText = "Period 0";
  
  //Special treatment for 4th - Regular lunch
  if ((currentPeriod == 4 && (option== 0||option==1||option==3)))
  {
    //Adjust to before lunch time Regular, Bear Time, and 2 Hour delay
    if (lunchOption==0){ //A Lunch
      if (timeToEnd >5400) {
        //it is lunch
        timeToEnd -= 5400;
        periodText = "Lunch Time";
      }
      else {
        periodText = "Period 4";
      }
    }
    else if (lunchOption==1){ //B Lunch
      if (timeToEnd >5400) {
        //it is before lunch - Subtract 90 minutes
        timeToEnd -= 5400;
        periodText = "To Lunch";
      }
      else if (timeToEnd > 3600) {
        //it is lunch time
        timeToEnd -= 3600;
        periodText = "Lunch Time";
      }
      else {
        periodText = "Period 4";
      }
    }
    else if (lunchOption==2){ //C Lunch
      if (timeToEnd >3600) {
        //it is before lunch - Subtract 1 hour
        timeToEnd -= 3600;
        periodText = "To Lunch";
      }
      else if (timeToEnd > 1800) {
        //it is lunch time
        timeToEnd -= 1800;
        periodText = "Lunch Time";
      }
      else {
        periodText = "Period 4";
      }
    }
    else {//option3
      if (timeToEnd >1800) { //D Lunch
        //it is before lunch - Subtract 1 hour
        timeToEnd -= 1800;
        periodText = "To Lunch";
      }
      else {
        periodText = "Lunch Time";
      }
    }
  } 
 
  /*********************
  ** Misc adjustments **
  *********************/
  
  // Brunch for 3 hour early dismissal
  else if (currentPeriod==4 && option == 2){ 
    if (timeToEnd >2100) {
      timeToEnd -= 2100;
      periodText = "Brunch";
    }
  }
  
  //Bear time
  else if (currentPeriod == 3 && option == 1) {
    if (timeToEnd > 3300) {
      timeToEnd -= 3300;
      periodText = "Flex Time";
    }
    else {
      periodText = "Period 3";
    }
  }
  else
      {periodText = "Period "+ currentPeriod;}
  
  /*********************
  ** Red for  Last 5  **
  *********************/
  
  if (timeToEnd <= 300) {
    document.getElementById("countDownLabel").style.fill = "red";
  } else {
    document.getElementById("countDownLabel").style.fill = "#82859b";
  }
  
  /*********************
  ** Update the clock **
  *********************/
  
  let mins = util.zeroPad(Math.floor(timeToEnd/60));
  let secs = util.zeroPad(timeToEnd%60);
  let timeMins = util.zeroPad(tday.getMinutes());
 //Set 
  if (hours > 12) {hours -= 12;} //Adjust clock for 12 hour versus 24 hour
  if (currentPeriod < 7 && tday.getHours()>=7) {
    countDownLabel.text = `${mins}:${secs}`;
    periodLabel.text = periodText;//`Period ${currentPeriod}`;
    timeLabel.text = `${hours}:${timeMins}    ${month} ${tday.getDate()}`;
  }
   else {
     countDownLabel.text = `${hours}:${timeMins}`;
     periodLabel.text = ``;
     timeLabel.text = `${month} ${tday.getDate()}`;
   }
     stepLabel.text = today.local.steps.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
     activeLabel.text = today.local.activeMinutes || 0;
     hourlyLabel.text = today.local.elevationGain || 0;
}

// Update the clock every tick event
clock.ontick = () => updateCountdown();

// Don't start with a blank screen
updateCountdown();


// Message is received
messaging.peerSocket.onmessage = evt => {

  if (evt.data.key=="lunchOption"){
    lunchOption = evt.data.value.selected;
  }
  if (evt.data.key=="timeOption"){
    option = evt.data.value.selected;
  }
  //Write settings to file for start up
  let json_data = {
    "timeOption": option,
    "lunchOption": lunchOption,
  };
  fs.writeFileSync(SETTINGS_FILE, json_data, SETTINGS_TYPE);
  
};

//Function to read and return settings
function loadSettings() {
  console.log("Reading Data");
  try {
    return fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
  } catch (ex) {
    // Defaults
    console.log("Read Defaults");
    return {
      timeOption:0,
      lunchOption:2
    }
  }
}
