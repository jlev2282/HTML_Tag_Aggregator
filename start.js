// Initialize the require node packages 
const mysql = require("mysql");
const inquirer = require("inquirer");
const fs = require("fs");
// require("console.table");
const Table = require('cli-table');
const moment = require('moment');

//will hold menu, tag criteria, directory and html file info
const info = {
  directories: [],
  directory: null,
  directory_files: [],
  menus: {
    main: ["Run Test", "View Scores", "Exit"],
    test: ["Run Single File", "Run Directory", "Main Menu"],
    view: ["View Single File", "View All", "View Range", "Main Menu"],
  },
  tagObject: {
    div: 3,
    p: 1,
    h1: 3,
    h2: 2,
    html: 5,
    body: 5,
    header: 10,
    footer: 10,
    font: -1,
    center: -2,
    big: -2,
    strike: -1,
    tt: -2,
    frameset: -5,
    frame: -5
  }
};

//the connection object to sync with a MySQL database
const connection = mysql.createConnection({
  host: "",

  // Your port;
  port: ,

  // Your username
  user: "",

  // Your password
  password: "",
  database: "scoring_project"
});

// Establishes the connection with mysql
connection.connect(function(err) {
  if (err) {
    return console.error("error connecting: " + err.stack);
  } else {

    console.log("Welcome to the 'HTML File Tag Aggregator' aka H.F.T.A.");
  }

  mainMenu();
});

//produces the main menu options for user
function mainMenu() {

  //Present the user with a list of options to choose from
  inquirer
    .prompt([
      //give user main menu options
      {
        name: "choice",
        type: "rawlist",
        choices: info.menus.main,
        message: "What would you like to do?"
      }
    ])
    .then(function(answer) {
      //Check if the user wants to exit
      checkForExit(answer.choice);

      switch(answer.choice) {
        case "Run Test":
          pickDirectory("test");
          break;
        case "View Scores":
          viewMenu();
          break;
        default:
          mainMenu();
      }
      
    });
}

//function that allows user to designate which directory hold html files
function pickDirectory(type) {
  //prompt user to designate the directory to work on
  if (type === "test") {
    inquirer
      .prompt([
        {
          name: "choice",
          type: "input",
          message: "Which directory contains the html files you'd like to work on?(no leading '/' required)"
        }
      ]).then(function(answer){
        //check if directory exist
        let dir = answer.choice.trim();
        if (fs.existsSync(dir)) {
          //assign user choice to info.directory and get files that are in that directory
          info.directory = dir;
          info.directory_files = fs.readdirSync(info.directory);
          testMenu(); 
        } else {
          console.log("'" + answer.choice + "' is not a valid directory.");
          return mainMenu();
        }
        
    });
  } else {
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: info.directories,
          message: "Which directory contains the file you'd like to view?"
        }
      ]).then(function(answer){
        //assign user choice to info.directory and get files that are in that directory
        info.directory = answer.choice;
        //Get the files from database with info.directory as their file_directory
        connection.query("SELECT * FROM files WHERE file_directory = ?", [info.directory], function(err, res) {
          if (err) {
            console.log(err);
            viewMenu();
          } else {
            if (res == 0) {
              console.log("There are no files in that directory to view");
              pickDirectory("view");
            } else {
              //store the found files in info for reference later
              for (let i = 0; i < res.length; i++) {
                info.directory_files.push(res[i].file_name);
              }
              pickFile("view");
            }
          }
          
        });
      });
  }
  
}

function testMenu() {
  //give user main menu options
  inquirer
    .prompt([
      {
        name: "choice",
        type: "rawlist",
        choices: info.menus.test,
        message: "What would you like to do?"
      }
  ]).then(function(answer){
    //based on response drop down to appropriate next menu
    switch(answer.choice) {
      case "Run Single File":
        pickFile("test");
        break;
      case "Run Directory":
        runAll();
        break;
      case "Main Menu":
        mainMenu();
        break;
      default:
        testMenu();
    }
  })
}

function viewMenu() {
  //loads all presently stored directories from database into file variable for use in menu options
  connection.query("SELECT DISTINCT file_directory FROM files", function(err, res) {
    if (err) {
      console.log(err);
    } else {
      if (res.length > 0) {
        for (let i = 0; i < res.length; i++){
          if (info.directories.includes(res[i].file_directory) != true){  
            info.directories.push(res[i].file_directory);
          }
        }
      }
      //check to see if any directories stored in info.directories. If none, then no data
      //exist in database. Return user to mainMenu
      if (info.directories.length === 0) {
        console.log("There is currently no data to view \n");
        return mainMenu();
      } else {
        inquirer
          .prompt([
            //give user main menu options
            {
              name: "choice",
              type: "rawlist",
              choices: info.menus.view,
              message: "What would you like to do?"
            }
        ]).then(function(answer){
          switch(answer.choice) {
            case "View Single File":
              pickDirectory("view");
              break;
            case "View All":
              viewAll();
              break;
            case "View Range":
              pickRange();
              break;
            case "Main Menu":
              mainMenu();
              break;
            default:
              viewMenu();
          }
        });
      }
    }
  });
}

//prompt to show current files in info.directory 
function pickFile(action) {
  inquirer
    .prompt([
      {
        name: "choice",
        type: "rawlist",
        choices: info.directory_files,
        message: "Which file would you like to work on?"
      }
    ]).then(function(answer){
        //store users selection in "file" and send to run/view-Scores
        let file = answer.choice;
        if (action === "view") {
          viewScores(file);
        } else {
          runScores(file, "one");
        }
    })

  
}

function pickRange(){
  inquirer
  .prompt([
    //ask user for start date in format mm/dd/yyy and validate
    {
      name: "start",
      type: "input",
      message: "Please enter a start date(YYYY-MM-DD).",
      validate: function(input){
        return moment(input, 'YYYY-MM-DD',true).isValid();
      }
    },
    //ask user for end date in format mm/dd/yyy and validate
    {
      name: "end",
      type: "input",
      message: "Please enter an end date(YYYY-MM-DD).",
      validate: function(input){
        return moment(input, 'YYYY-MM-DD',true).isValid();
      }
    }
  ]).then(function(answer) {
      let start = answer.start;
      let end = answer.end;
      viewAll(start, end);
  })
}

//for instance user selects to run scores for an entire directory
function runAll() {
  //here loop over info.directory and send each file to runScores
  for (let i = 0; i < info.directory_files.length; i++) {
    if (i < (info.directory_files.length -1)) {
      runScores(info.directory_files[i], "many");
    } else {
      runScores(info.directory_files[i], "one");
    }
  }
}

//runs scores for an individual file
function runScores(file, num) {
  //create empty object fileScore 
  //should have initial properties of "fileName", "lowest", "highest", and "average"
  let fileScore = {
        file_directory: info.directory,
        file_name: file,
        lowest: null,
        highest: null,
        average: 0,
        ran_on: new Date()
  }
  let tags = Object.keys(info.tagObject);
  let path = info.directory + "/" + file;
  //begin read in of file
  fs.readFile(path, "utf8", function(error, data){
    if (error) {
      console.log("I'm sorry, the operation failed because of the following: \n" + error);
      return testMenu();
    }
    
    //loop over file for each tag from tagArray 
    for (let i = 0; i < tags.length; i++) {
      //set intial values to 0 for current tag in fileScore
      fileScore[tags[i]] = 0;

      //find all instances of current tag in current file
      let regex = new RegExp("<" + tags[i] + ">", "ig");
      let result = data.match(regex);

      //check to make sure result did not return null and divide result array 
      //by 2 for element pair count
      if (result != null) {
        fileScore[tags[i]] = (result.length) * info.tagObject[tags[i]];
      }

      //cumulate average and set lowest, and highest values while in loop for current tag
      fileScore.average += fileScore[tags[i]];
      fileScore.lowest = Math.min(fileScore.lowest, fileScore[tags[i]])
      fileScore.highest = Math.max(fileScore.highest, fileScore[tags[i]]);
    }

    //set average
    fileScore.average = (fileScore.average / tags.length).toFixed(2);

    //send data to sql function for submission and get back to testMenu if last file to run
    if (num === "one") {
      submitScores(fileScore, testMenu);
    } else {
      submitScores(fileScore);
    }
  });    
}

function submitScores(scores, cb){
  //check in database to see if this file has already been tested
  let query = "SELECT * FROM files WHERE file_directory = ? AND file_name = ?";  
  connection.query(query, [info.directory, scores.file_name], function(err, res) {
    if (err) {
      console.log(err);
    } else {
        //if tested previously prompt user to skip or update
        if (res.length > 0) {
          inquirer
            .prompt([
              {
                name: "choice",
                type: "confirm",
                message: scores.file_name + " has been run before. Run again? \n",
              }
            ]).then(function(answer){
              //if skip, return if update, update
              if (answer.choice === true) {
                connection.query("UPDATE files SET ? WHERE ? AND ?", [scores, {file_directory: scores.file_directory}, {file_name: scores.file_name} ], function(err, res) {
                  if (err) {
                    console.log(err)
                  } else {
                    console.log("File '"+scores.file_name+"' was successfully updated");
                    if (cb) {
                      setTimeout(cb, 500);
                    }
                  }
                });
              } else {
                console.log("Ok!");
                if (cb) {
                  setTimeout(cb, 500);
                }
              }
            });

          } else {
          //submit data to database
          connection.query("INSERT INTO files SET ?", scores, function(err, res) {
            if (err) {
              console.log(err)
            } else {
              console.log("File '"+scores.file_name+"' was successfully submitted");
              if (cb) {
                cb();
              }
            }
          });
        } 
    }

  });

}

//function for rendering scores of single file
function viewScores(file) {
  //query database for data on selected file
  let query = "SELECT * FROM files WHERE file_directory = ? AND file_name = ?";
  connection.query(query, [info.directory, file], function(err, res){
    if (err) {
      console.log(err);
      viewMenu();
    } else {
      //retrieve tags from tagObject
      let columns = Object.keys(info.tagObject);
      //add columns not in tagObject but in datbase in proper places for rendering
      columns.unshift("file_id", "file_directory", "file_name");
      columns.push("lowest", "highest", "average", "ran_on");
      
      let table = new Table();
        //for each response object return add the data for the specific tag data corresponds to
        for (let i = 0; i < columns.length; i++) {
          let currentCol = {};
          let colValues = [];
          for (let j = 0; j < res.length; j++) {
            //push response value into correct array
            if (columns[i] == "ran_on") {
              //format ran_on to be viewed in desired format
              colValues.push(moment(res[j][columns[i]]).format("MM-DD-YYYY"));
            } else {
              colValues.push(res[j][columns[i]]);
            }
          }
          currentCol[columns[i]] = colValues;
          table.push(currentCol);
      }    

      //render table
      console.log(table.toString());
      
      //return user to view menu
      viewMenu();
    }
  });
}

//function to render all files in database
function viewAll(range1, range2){
  //check if there is a supplied date range
  if (range1){
    var query = "SELECT * FROM files WHERE (ran_on BETWEEN ? AND ?)";
    var params = [range1, range2];
  } else {
    //if not query for all files in database
    var query = "SELECT * FROM files";
    var params = [];
  }
  connection.query(query, params, function(err, res){
    if (err) {
      console.log(err);
      viewMenu();
    } else {

    if (res.length == 0 ) {
      console.log("No results found")
      return viewMenu();
    }
      //retrieve tags from tagObject
      let columns = Object.keys(info.tagObject);
      //add columns not in tagObject but in datbase in proper places for rendering
      columns.unshift("file_id", "file_directory", "file_name");
      columns.push("lowest", "highest", "average", "ran_on");
      
      let table = new Table();
      //loop over columns and for each one add values into correct array for that column
      for (let i = 0; i < columns.length; i++) {
        let currentCol = {};
        let colValues = [];

        //for each response object return add the data for the specific tag data corresponds to
        for (let j = 0; j < res.length; j++) {
          if (columns[i] == "ran_on") {
            //format ran_on to be viewed in desired format
            colValues.push(moment(res[j][columns[i]]).format("MM-DD-YYYY"));
          } else {
            colValues.push(res[j][columns[i]]);
          }
        }

        currentCol[columns[i]] = colValues;
        table.push(currentCol);
      }
      
      //render table
      console.log(table.toString());

      //return user to view menu
      viewMenu();
    }
  });
}

//function to see if user wants to quit the program
function checkForExit(choice) {
    if (choice.toLowerCase() === "exit") {
        // Tell the user goodbye and exit
        console.log("See you next time!");
        process.exit(0);
    }
}