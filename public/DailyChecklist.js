let container = document.getElementById('listDiv');
let fieldElement = document.getElementById('add-task');

// Crosses out tasks
function finishTask(checkbox, label)
{
    // var is for function specific (u can define it in multiple funcs) 
    // let is for block (u can only define it once)
    var isChecked = checkbox.checked;
    var labelText = label.innerText;
    if(isChecked) label.innerHTML = "<del>" + labelText + "</del>";
    else label.innerHTML = labelText;
}

// Deletes tasks
function deleteTask(itemDiv, line){
    itemDiv.parentNode.removeChild(itemDiv);

    fetch('/removeline', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ task: line })
    })
    .then(res => res.json())
    .then(msg => console.log(msg.message))
    .catch(err => console.error("Failed to delete task from file: ", err));
}

// Adds tasks on HTML
function addTask(line){
    var itemDiv = document.createElement("div");
    itemDiv.id = "item-div";
    itemDiv.style = "margin: 5px";
    
    // Checkbox
    var newTask = document.createElement("input");
    newTask.type = "checkbox";
    newTask.className = "tasks";
    newTask.id = "task";
    newTask.value = line;

    // Label alongside checkbox
    var label = document.createElement("label");
    label.htmlFor = newTask.id;
    label.id = "labelTask";
    label.textContent = line;

    // Button
    var deleteButton = document.createElement("button");
    deleteButton.id = "delete-button";
    deleteButton.textContent = "X";

    // changes the content of the label based on newTask actions
    newTask.onchange = () => finishTask(newTask, label);
    deleteButton.onclick = () => { 
        deleteTask(itemDiv, line); 
    };

    itemDiv.appendChild(newTask);
    itemDiv.appendChild(label);
    itemDiv.appendChild(deleteButton);
    container.appendChild(itemDiv);
}

function submitTask(){
    var fieldValue = fieldElement.value;
    if(fieldValue == null || fieldValue == ""){
        window.alert("Field is blank. Please enter a task.");
        return;
    }

    addTask(fieldValue);

    fetch('/addline', {
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({ task: fieldValue })
    })
    .then(res => res.json())
    .then(msg => console.log(msg.message))
    .catch(err => console.error("Client Side: Failed to save task: ", err));

    fieldElement.value = "";
}

// Loads the lines from the txt file when the page is loaded
window.addEventListener('DOMContentLoaded', () => {
    console.log("Page is ready!");

    fetch('/readlines') 
    .then(response => response.json()) 
    .then(lines => { 
        if(Array.isArray(lines)){ //checks if lines is an array (not json)
            lines.forEach(line => {
                addTask(line);
            });
        } else if (lines.error){ // lines becomes json
            alert("server error: " + lines.error);
        } else {    // idk random server error repsonse
            alert("Unexpected server response");
        }
    })
    .catch(err => { // catches errors
        console.error(err);
    });

    /* This is a simple message request. Not gonna delete it cause it's useful
    fetch('/message')
    .then(response => response.json())
    .then(data => {
        console.log("server says: ", data.message);
    })
    .catch(err => {
        console.error("Failed to fetch message: ", err);    
    });
    */
});

// Similar to python, it kinda just starts from here
document.getElementById("add-task").addEventListener("keydown", function(event){
    console.log("This is a thing");
    if(event.key == "Enter"){
        event.preventDefault()
        submitTask();
    } 
});