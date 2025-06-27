const fs = require("fs");               // used for reading and writing files
const readline = require("readline");   // reads input line by line
const express = require("express");     // web framework for node.js that handles http requests and routes
const path = require("path");

//--- variables ---
// enabling server stuff
const app = express();  
const PORT = 3000;

// file path to checklist.txt
const file = path.join(__dirname, "checklist.txt");
    
// Serve any file inside the public/ folder when someone accesses the root URL
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Simple app.get function 
app.get("/message", (req, res) => {
    res.json({message: "Hello!"});
});

// Reading lines from the checklist.txt file
app.get("/readlines", (req, res) => { // defines a new route
    // when the browser requests http://localhost:3000/readlines, this code runs
    const lines = []; // stores each line of the file

    var rl = readline.createInterface({
        input: fs.createReadStream(file),   // opens the file and reads a line
        crlfDelay: Infinity                 // ensures compatibility with different line endings (like Windows \r\n or Unix \n)
    });

    // event where for every line read, we print it out to the console
    rl.on("line", (line) => {
        lines.push(line); //pushes each line into the array
    });

    // once the file has been fully read, the close event is triggered
    rl.on("close", () => {
        res.json(lines);    // sends the array of lines to the browser as a JSON file
    });

    // runs this if something goes wrong with reading the file (like file DNE)
    rl.on("error", (err) => {
        console.error("checklist.txt DNE: " + err);
        const createFile = fs.createWriteStream(file);
        createFile.end();
        
        res.status(500).json({error: "Error reading file"});
    });
});

// Adding a task/line to checklist.txt
app.post("/addline", (req, res) => {
    // we get task from JSON file in the body with property "task" and trim it basically
    const task = req.body.task?.trim();

    if(!task){
        return res.status(400).json({error: "No task provided"});
    }

    fs.appendFile(file, task + "\n", (err) =>{
        if(err){
            console.error("Error writing to file: " + err);
            return res.status(500).json({error: "Failed to save task"});
        }
        res.json({message: "Task added successfully"});
    });
});

app.post("/removeline", (req, res) => {
    const task = req.body.task?.trim();
    const temp = fs.createWriteStream(path.join(__dirname, "temp.txt"));

    if(!task){
        return res.status(400).json({error: "No task seleted."});
    }

    console.log("rl");
    var rl = readline.createInterface({
        input: fs.createReadStream(file),
        crlfDelay: Infinity
    });

    console.log("line");
    rl.on("line", line => {
        if(line === task){
            console.log("line === task");
        } else{
            temp.write(line + "\n");
            console.log("not line === task");
        }
    });

    rl.on("close", () => {
        // ending the writestream for temp
        temp.end();

        //removing old checklist file
        fs.unlink(file, (err) =>{
            if(err){
                console.error("Error occurred when removing file: " + err);
            }else{
                console.log("Successfully removed file.");
            }
        });

        // replacing old checklist file with a new one
        fs.rename("temp.txt", "checklist.txt", (err) => {
            if(err){
                console.error("Error occurred when renaming file: " + err);
            } else{
                console.log("Successfully renamed file.");
            }
        });

        return res.json({message: task});
    });
    
    // catches an error
    rl.on("error", (err) => {
        return res.status(500).json({error : "An error occurred."});
    });
});

app.use((req, res) => {
   res.status(404).send("404 URL NOT FOUND");
});

// localhost: 3000
app.listen(PORT, () => {
    console.log("server is running on http://localhost:3000");
});

// Code starts from here
console.log("Reading file... (this runs first apparently)");
