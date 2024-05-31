let ws;

document.getElementById("CreateRoom").addEventListener("click", function () {
    let roomName = prompt("Enter the name of the new room:");
    if (roomName) {
        let newOption = document.createElement("option");
        newOption.value = roomName.toLowerCase();
        newOption.textContent = roomName;
        document.getElementById("roomSelect").appendChild(newOption);
    }
});

function newRoom() {
    // calling the ChatServlet to retrieve a new room ID
    let callURL = "http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat-servlet";
    fetch(callURL, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
        },
    })
        .then(response => response.text())
        .then(code => enterRoom(code)) // enter the room with the code
        .catch(error => console.error('Error fetching new room:', error));

    document.getElementById("CreateRoom").addEventListener("click", function () {
        newRoom();
    });

}

function enterRoom(code) {
    const username = prompt("Enter your username:");
    if (!username) return; // If the user cancels the prompt, do nothing

    ws = new WebSocket("ws://localhost:8080/WSChatServer-1.0-SNAPSHOT/ws/" + code);

    ws.onmessage = function (event) {
        const message = JSON.parse(event.data);
        const timestamp = message.timestamp; // Assuming the server sends back a timestamp

        // Display the username, timestamp, and message
        document.getElementById("log").value += "[" + timestamp() + "] " + message.message + "\n";
    };

    // Function to send message to server
    function sendMessage(msg) {
        const data = {
            type: "chat",
            username: username, // Include username in the message
            msg: msg
        };
        ws.send(JSON.stringify(data));
    }

    // Event listener for input field
    document.getElementById("input").addEventListener("keyup", function (event) {
        if (event.key === "Enter") {
            sendMessage(event.target.value);
            event.target.value = "";
        }
    });
}

/****************Input*****************************/
const inputField = document.getElementById("input");
const chatLog = document.getElementById("log");

// Add event listener to the input field
inputField.addEventListener("keyup", function(event) {
    // Check if the Enter key was pressed
    if (event.key === "Enter") {
        // Get the user input from the input field
        const userInput = inputField.value.trim();

        // Check if the user input is not empty
        if (userInput !== "") {
            // Append the user input to the textarea
            chatLog.value += userInput + "\n";

            // Clear the input field
            inputField.value = "";
        }
    }
});

// Function to populate the room select dropdown
function populateRoomSelect() {
    // Create the room select dropdown
    const roomSelect = document.createElement("select");
    roomSelect.id = "roomSelect";

    // Add default options
    const defaultOptions = ["General", "Random"];
    defaultOptions.forEach(option => {
        const defaultOption = document.createElement("option");
        defaultOption.value = option.toLowerCase();
        defaultOption.textContent = option;
        roomSelect.appendChild(defaultOption);
    });

    // Append the room select dropdown to the container
    document.getElementById("roomSelect").appendChild(roomSelect);

    // Add event listener to the room select dropdown
    roomSelect.addEventListener("change", function() {
        // Clear the chat log when a room is selected
        clearChatLog();
    });
}

// Call the function to populate the room select dropdown initially
populateRoomSelect();

// Function to clear the textarea
function clearChatLog() {
    document.getElementById("log").value = "";
}

// Add event listener to the room select dropdown
document.getElementById("roomSelect").addEventListener("change", function(event) {
    // Check if the change event is triggered by the room select dropdown
    if (event.target && event.target.id === "roomSelect") {
        // Clear the chat log when a room is selected
        clearChatLog();
    }
});

// Add event listener to update ChatRoomTitle
document.getElementById("roomSelect").addEventListener("change", function() {
    // Get the selected room name
    const selectedRoom = this.value;
    // Update the ChatRoomTitle with the selected room name
    document.querySelector(".ChatRoomTitle h3").textContent = selectedRoom;
});

function timestamp() {
    // function to generate a timestamp
    let now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    return `${hours}:${minutes}:${seconds}`;
}
