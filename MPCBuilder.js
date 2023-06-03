#include <pjsr/StdButton.jsh>
#include <pjsr/StdIcon.jsh>
#include <pjsr/DataType.jsh>

#define DAY_IN_SECONDS 86400
#define MINUTE_IN_SEC 60
#define MPBUILDERVERSION "0.1"



// Define the asteroid, localisalisation informations
var packedNumber = "XXXXX"; // 5 chars
var provisionalDesignation = "       "; // default : blank caracters  - 7 chars
var discoveryAsterisk = " "; // default : blank caracter , can be '*' - 13rd char
var note1 = " "; // default : blank, F as Faint image, P poor image, ...  - https://www.minorplanetcenter.net/iau/info/ObsNote.html
var note2 = "B"; // default B : CMOS - C: CCD
var observationDate = "YYYY MM DD.dddddd"; // starting at 16 cols - 17 chars usually given at 0.00001 days
var observedRA = "HH MM SS.ddd"; // starting at 33 cols - 12 chars - usually given at 0.01s
var observedDecl = "sDD MM SS.dd"; //starting at 45 cols - 12 chars - usually givent at 0.1" 's' is +/-

/*********************************************************************************/
// Define observer and telescope informations
var observatoryCode = "XXX";
var contactName = "A. Dupont";
var contactDetails = "[obs_lanine@pm.me]";
var obsDetails1 = "Long. 1 19 53.8 E, Lat. 43 12 54.4 N, Alt. 337m, Google Earth";
var obsDetails2 = "Observatoire de la Nine, Canens, Occitanie, FRANCE";
var observers = "A. Dupont";
var measurers = "A. Dupont";
var telescopeDetails = "200 mm f/4 reflector + CMOS";
var cataloguesUsed = ["Gaia-DR3"];
var comment = "This is a test observation.";
var observationCount = 1;
var ackWords = "NEW SITE XXX - batch 001 - 2023-06-03 10:50:15 GMT+2";
var acknowledgmentEmails = "obs_lanine@pm.me";

var magnitudeBand = "B"; // TODO 'T' for
var observedMagnitude = "12.34"; // "observed magnitude" - usually at 0.1

/*********************************************************************************/


//Divers
//var timeHMObs = "00 00";
//var decSecTimeObs = "0.00000";
var dateObsISO = "";
var yearObs = 0;
var monthObs = 0; // 0-indexed
var dayObs = 0;
var hoursxxObs = 0;
var minutesxxObs = 0;
var secondsxxObs = 0;
var milliSecondsObs = 0;


//CSV Reading
var csvImageName = new Array();
var csvRA = new Array();
var csvDEC = new Array();
var mpName = new Array();

var found = 0;
var buildADESXML = false;
var buildADESPSV = false;
var buildMPC1992 = false;
var selectedFormat = false;
var debugMode = false; // put to true to activate debug mode
var adesPSVContent = "";
var adesXMLContent = "";
var MPC1992Content = "";
var isFormatSelected = false;


function logDebug(message) {
  if (debugMode) {
    console.writeln(message);
  }
}

// To space to set the right length
function padStringWithSpaces(str, length) {
  let paddedStr = str;
  while (paddedStr.length < length) {
    paddedStr += " ";
  }
  return paddedStr;
}

function getKeywords(window) {
  let keywords = window.keywords;
  let result = {};

  for (let i = 0; i < keywords.length; ++i) {
    let key = keywords[i];
    if (key && (key.name === "DATE-OBS" || key.name === "EXPTIME")) {
      result[key.name] = key.value;
    }
  }

  return result;
}

function parseRADEC(posSTR,typePos) {
   var pos = posSTR.toString().split(' ');
   logDebug("POS : "+ pos);
   let parsedPos = "";
   for ( let m =0; m < pos.length; m++) { // check each part of RA/DEC
      logDebug("posm[m] : " +  pos[m].charAt(0));
      let tmp = "";
      if ((pos[m].charAt(0) == "+") || (pos[m].charAt(0) == "-")) { // DEC first token sDD ?
         logDebug("token + - : ");
         if ((pos[m].length-1) < 3){ // if length < 3 : only one digit
               tmp = "0" + pos[m].charAt(1);
               tmp = pos[m].charAt(0) + tmp;
            }
         else {
              tmp = "0" + pos[m].substring(1,pos[m].length-1);
              tmp = pos[m].charAt(0) + tmp;
         }
      }
      else //contains nor + and -
	  {
         logDebug("pos[m] est inf a 10 : "+ pos[m] );
		 if (pos[m] < 10 && pos[m].charAt(0) != '0' )
		     tmp =  "0" + pos[m];
		 else
			 tmp = pos[m];}

      logDebug("pos[m] contains '.' ? : "+ tmp );
      if (tmp.contains(".",0)) {
          switch (typePos) {
          case 0 : //RA
            tmp = tmp.toFloat().toFixed(2);
            break;
          case 1 : //DEC
            tmp = tmp.toFloat().toFixed(1);
            break;
          default :
            break;
      }
      logDebug("Rounded = " + tmp);
      tmp =  (tmp < 10 ? "0" : "") + tmp;
      }

      if (( m < pos.length-1) )
        parsedPos = parsedPos + tmp + " ";
      else
        parsedPos = parsedPos + tmp;

   logDebug("RA / DEC : " + parsedPos);
   }
   return parsedPos;

}

function parseISODate(dateStr) {
  dateStr = dateStr.substring(1, dateStr.length - 1);
  dateStr = dateStr + "Z";
  logDebug("Date ParseISODate Texte : " + dateStr);
  return new Date(dateStr);
}

function formatTimeDigits(value) {
  return value < 10 ? "0" + value : value.toString();
}

function calculateFormattedDayObs(dayObs, inDayHour) {
  let formattedDayObs = dayObs + inDayHour;
  return formattedDayObs.toFixed(5);
}

function formatInDayHour(formattedDayObs) {
  return (formattedDayObs < 10 ? "0" : "") + formattedDayObs;
}

// Save a MPC Report using the right extension - depends of value isBuild : 0 - ADES XML ; 1 - ADES PSV ; 2 - MPC1992
function saveReport(isbuild) {

// Save the content to a file
var formatExtension = isbuild === 0 ? "xml" : isbuild === 1 ? "psv" : "txt";
var filePath = "Z:/travaux/asteroids/batch_0001/MPCReport." + formatExtension;
var file = new File;
file.createForWriting(filePath);

var type = "default";
switch (isbuild) {  // TODO Incorrect gestion reprendre buildMPC1992 chaque type peut être produit
   case 0 :
      type = "ADES XML";
      file.outText(adesXMLContent);
      break;
   case 1 :
      type = "ADES PSV";
      file.outText(adesPSVContent);
      break;
   case 2 :
      type = "MPC1992";
      file.outText(MPC1992Content);
      break;
   default :
      type = "default";
}
file.close();

// Display a message to the user
var message =
  "The " + type + " file was created successfully!\n\n" +
  "File Path: " + filePath;
new MessageBox(message, type + " file Created", StdIcon_Information).execute();
}

function mpcReportBuild(window,indexCSV)
{
var dateObs = "";
var expTime = 0;

if (window) {
  let keywords = getKeywords(window);

  if ("DATE-OBS" in keywords && "EXPTIME" in keywords) {
    dateObs = keywords["DATE-OBS"];
    expTime = keywords["EXPTIME"];
    found = 2;
  }
  logDebug ("MPCReportBuild step2");
  if (found < 2) {
    new MessageBox(
      "The image has no 'DATE-OBS' & 'EXPTIME' keywords",
      TITLE,
      StdIcon_Error,
      StdButton_Ok
    ).execute();
  }
}


logDebug(window.currentView.fullId);

dateObs = new String(dateObs);
dateObsISO = parseISODate(dateObs);
logDebug("Date Texte : " + dateObsISO.toString());

yearObs = dateObsISO.getUTCFullYear();
monthObs = dateObsISO.getUTCMonth() + 1; // 0-indexed
dayObs = dateObsISO.getUTCDate();
hoursxxObs = dateObsISO.getUTCHours();
minutesxxObs = dateObsISO.getUTCMinutes();
secondsxxObs = dateObsISO.getUTCSeconds();
milliSecondsObs = dateObsISO.getUTCMilliseconds();
logDebug("MilliSecondesISO : " + milliSecondsObs);
milliSecondsObs = milliSecondsObs / 1000;

logDebug("Pose : " + expTime);
logDebug("AnneeISO : " + yearObs);
logDebug("MoisISO : " + monthObs);
logDebug("JoursISO : " + dayObs);
logDebug("Heure : " + hoursxxObs);
logDebug("MinutesISO : " + minutesxxObs);
logDebug("SecondesISO : " + secondsxxObs);
logDebug("MilliSecondesISO : " + milliSecondsObs);

expTime = expTime / 2;
logDebug("Pose moitié: " + expTime);
var minCalc = Math.floor(expTime / MINUTE_IN_SEC);
var secCalc = expTime % MINUTE_IN_SEC;
logDebug("minCalc : " + minCalc + " secCalc : " + secCalc);
minutesxxObs = minutesxxObs + minCalc;
secondsxxObs = secondsxxObs + secCalc;
var inDayHour =
  (hoursxxObs * 3600 + minutesxxObs * 60 + secondsxxObs + milliSecondsObs) /
  DAY_IN_SECONDS;
logDebug(format("inDayHour : %.5f day", inDayHour));

var formattedDayObs = calculateFormattedDayObs(dayObs, inDayHour);
var formattedInDayHour = formatInDayHour(formattedDayObs);
logDebug ("MPCReportBuild step3");
monthObs = formatTimeDigits(monthObs);

observationDate =  yearObs + " " + monthObs + " " + formattedInDayHour;
console.writeln("Observation Date UTC : " + observationDate);
// Construction ligne data
buildBodyReport(indexCSV);
  }



/*************************************************
*  BUILD REPORT HEADERS
***************************************************/
function buildHeaders() {
	if (buildADESXML) { // TODO 
		// XML format
  adesXMLContent += '<?xml version="1.0" encoding="UTF-8"?>\n';
  adesXMLContent += '<ades - version = 2022>\n';
  adesXMLContent += '  <header>\n';
  adesXMLContent += '    <cod>ABC</cod>\n';
  adesXMLContent += '    <con>' + contactName + ' ' + contactDetails + '</con>\n';
  adesXMLContent += '    <obs>' + observers + ', ' + '</obs>\n';
  adesXMLContent += '    <mea>' + measurers+ ', ' + '</mea>\n';
  adesXMLContent += '    <tel>' + telescopeDetails + '</tel>\n';
  adesXMLContent += '    <net>' + cataloguesUsed + ', ' + '</net>\n';
  adesXMLContent += '    <bnd>' + magnitudeBand + '</bnd>\n';
  adesXMLContent += '    <com>' + comment + '</com>\n';
  adesXMLContent += '    <num>' + observationCount + '</num>\n';
  adesXMLContent += '    <ack>ACK [' + acknowledgmentEmails + ',' + ']</ack>\n';
  adesXMLContent += '    <ac2>' + acknowledgmentEmails + ',' + '</ac2>\n';
  adesXMLContent += '  </header>\n';
	}
	if (buildADESPSV) {
		// TODO PSV Header
	}
	if (buildMPC1992) {
  // MPC1992 format
  MPC1992Content += 'COD ' + observatoryCode + '\n';
  MPC1992Content += 'CON ' + contactName + ' ' + contactDetails + '\n';
  MPC1992Content += 'OBS ' + observers + '\n';
  MPC1992Content += 'MEA ' + measurers + '\n';
  MPC1992Content += 'TEL ' + telescopeDetails + '\n';
  MPC1992Content += 'COM ' + obsDetails1 + '\n';
  MPC1992Content += 'COM ' + obsDetails2  + '\n';
  MPC1992Content += 'NUM ' + observationCount + '\n';
  MPC1992Content += 'ACK ' + ackWords +'\n';
  MPC1992Content += 'AC2 ' + acknowledgmentEmails + '\n';
  MPC1992Content += 'NET ' + cataloguesUsed + '\n';
  MPC1992Content += '\n';
	}
}

/*************************************************
*  BUILD RECORDED DATA
***************************************************/
function buildBodyReport(index) {
	if (buildADESXML) {

	  adesXMLContent += '  <asteroid>\n';
	  adesXMLContent += '    <packedNumber>' + packedNumber + '</packedNumber>\n';
	  adesXMLContent += '    <provisionalDesignation>' + provisionalDesignation + '</provisionalDesignation>\n';
	  adesXMLContent += '    <discoveryAsterisk>' + discoveryAsterisk + '</discoveryAsterisk>\n';
	  adesXMLContent += '    <note1>' + note1 + '</note1>\n';
	  adesXMLContent += '    <note2>' + note2 + '</note2>\n';
	  adesXMLContent += '    <observationDate>' + observationDate + '</observationDate>\n';
	  adesXMLContent += '    <observedRA>' + observedRA + '</observedRA>\n';
	  adesXMLContent += '    <observedDecl>' + observedDecl + '</observedDecl>\n';
	  adesXMLContent += '    <observedMagnitude>' + observedMagnitude + '</observedMagnitude>\n';
	  adesXMLContent += '    <magnitudeBand>' + magnitudeBand + '</magnitudeBand>\n';
	  adesXMLContent += '    <observatoryCode>' + observatoryCode + '</observatoryCode>\n';
	  adesXMLContent += '  </asteroid>\n';
	  adesXMLContent += '</ades>';

	}
	if (buildADESPSV) {
	  // PSV format
	  adesPSVContent += packedNumber + '|' + provisionalDesignation + '|' + discoveryAsterisk + '|';
	  adesPSVContent += note1 + '|' + note2 + '|' + observationDate + '|';
	  adesPSVContent += observedRA + '|' + observedDecl + '|         |';
	  adesPSVContent += observedMagnitude + magnitudeBand + '|        |' + observatoryCode + '\n';

	}
	if (buildMPC1992) {
	  MPC1992Content += packedNumber  ;
	  MPC1992Content += provisionalDesignation ;
	  MPC1992Content += discoveryAsterisk ;
	  MPC1992Content += note1; // quality of observation data
	  MPC1992Content += note2; // origin of data - C : CCD / B : CMOS - default
	  MPC1992Content += padStringWithSpaces(observationDate,17); // 17 chars
	  MPC1992Content += padStringWithSpaces(csvRA[index],12); //12 chars
	  MPC1992Content += padStringWithSpaces(csvDEC[index],12); //12 chars
	  MPC1992Content += '         '; // 9 blanks mandatory
	  MPC1992Content += padStringWithSpaces(observedMagnitude,4) + magnitudeBand;
	  MPC1992Content += '      ';// 6 blanks mandatory
	  MPC1992Content += observatoryCode +'\n';

	}

	}

//  lecture d'un fichier CSV avec séparateur ";" en PJSR

function readCSVFile(filePath) {
   let file = new File;
   try {
   file.openForReading(filePath);
      //throw new Error("Impossible d'ouvrir le fichier CSV : " + filePath);
   }
   catch (err) {
	   console.criticalln(err);
	   }
        let fileContent = File.readTextFile(filePath);
		var lines = fileContent.split('\n');
		// Find name from filepath
		var fileName = File.extractName(filePath);
		logDebug("nom fichier csv : " + fileName + " Number of records : " + (lines.length-2));
		// Get tokens '
		var parts = fileName.split('_');
		// check if at lest there's a token
		if (parts.length > 0) {
			// Read 1st fifth caracters : should be the packed number
			let tmpName = parts[0].substring(0,5);
			mpName = tmpName;
		} else {
			console.warningln("Le nom du fichier ne contient pas de parties séparées par '_'");
		}
		//For each record(line) of csv file
	   for (let k = 1; k < lines.length - 1 ;  k++) { // last line is a one character
	    var fields = lines[k].split(',');
		 for (let j = 0; j < fields.length; j++) { // each field of the line

			var value = fields[j];
			 switch (j) { // searching usefull column
				case 0 :
				   csvImageName.push(value);
				   logDebug("ViewID: " + csvImageName[csvImageName.indexOf(value)]);
				   break;
				case 8 :
                   let tmpRA = parseRADEC(value,0);
				   csvRA.push(tmpRA);
				   logDebug("RA: " + csvRA[csvRA.indexOf(tmpRA)]);
				   break;
				case 9 :
                   let tmpDEC = parseRADEC(value,1);
				   csvDEC.push(tmpDEC);
				   logDebug("DEC: " + csvDEC[csvDEC.indexOf(tmpDEC)]);
				   break;
				default :
				   break;
         }
		}
	  }
   file.close();
}


/**************************************************************
* Constructeur
***************************************************************/
function MPCBuilder() {

 logDebug ("constructeur MPCBuilder");
  /************************************************
  * MPCBuilder -- Fonction buildReport
  *  - read files, initiate variables, build files and save them
  **************************************************/
    this.buildReport = function (imagesFiles, dataFiles ) {
	console.writeln ("Building Header Report ...");
	buildHeaders();
	// for each image file, we stock dates, and name and then search
				   for ( let j = 0; j < dataFiles.length; j++ ) { // For each CSV files
				    let datafilePath = dataFiles[ j ];
					try {
						logDebug("*******DONNEES CSV *********");
						logDebug(datafilePath);
						mpName = ""; //reinit of data for each csv
						readCSVFile(datafilePath); // read data of the CSV file
						packedNumber = mpName;
						let fileWindow = null;
						logDebug("Number of csv records : " + csvImageName.length);
						let isClosed = false;
						for ( let l=0; l < csvImageName.length; l++) { // Find pictures used in CSV
								logDebug(" " + csvImageName[l].toString());
								let tmp = csvImageName[l].toString();
								for ( let i = 0; i < imagesFiles.length; i++ ) // search each images files
									{
									let filePath = imagesFiles[ i ];
									isClosed = false;
									logDebug("Image to analyse : " + imagesFiles[i] );
									fileWindow = ImageWindow.open( filePath )[0]
									let nameView = fileWindow.currentView.id;
									if (nameView.toString() == tmp) {
										logDebug("Image found ! :" + nameView );
										mpcReportBuild(fileWindow,csvImageName.indexOf(nameView));
										fileWindow.close();
										break;}
									else {
										logDebug(tmp);
										logDebug(nameView);
										fileWindow.close();
									}
									logDebug("next image");
									}
						}
						logDebug("go to next csv record");
					//scan all lines of csv, reinit for next file
					csvImageName = [];
					csvRA = [];
					csvDEC = [];
					}
					catch (error) {
						console.criticalln(error);
					}
				}

            if (buildMPC1992)
               saveReport(2);
            if (buildADESXML)
               saveReport(0);
            if (buildADESPSV)
               saveReport(1);

			};

 this.setFormatReport = function (reportType) {
  switch (reportType) {
   case 0 :
         if (!buildMPC1992)
            buildMPC1992 = true;
         else
            buildMPC1992 = false;
            logDebug("MPC1992 Format selected : " + buildMPC1992);
         break;
   case 2 :
         if (!buildADESXML)
            buildADESXML = true;
         else
             buildADESXML = false;
             logDebug("ADES XML Format selected : " + buildADESXML);
         break;
   case 1 :
         if (!buildADESPSV)
            buildADESPSV = true;
         else
             buildADESPSV = false;
             logDebug("ADES PSV Format selected : " + buildADESPSV);
         break;
   default :
      throw new Error("Report Format Unknown");
   }
  isFormatSelected = buildMPC1992 | buildADESXML | buildADESPSV ;
  return isFormatSelected;
 };
}


