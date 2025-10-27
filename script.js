const chatbotMessages = document.getElementById('chatbot-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let destination = '';
let map;
let directionsService;
let directionsRenderer;

// Initialize the map
function initMap() {
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    const chicago = new google.maps.LatLng(41.850033, -87.6500523);
    const mapOptions = {
        zoom: 7,
        center: chicago,
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsRenderer.setMap(map);
}

// Function to add a message to the chat
function addMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.innerHTML = message; // Changed to innerHTML to render the link
    chatbotMessages.appendChild(messageElement);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Function to handle user input
function handleUserInput() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, 'user');
        userInput.value = '';

        if (!destination) {
            destination = userMessage;
            addMessage('Great! Now, please allow access to your current location to get directions.', 'bot');
            getCurrentLocation();
        }
    }
}

// Function to get user's current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            addMessage('Thank you! Calculating the route now...', 'bot');
            calculateAndDisplayRoute(currentLocation, destination);
        }, () => {
            addMessage('Sorry, I was unable to retrieve your location. Please ensure you have location services enabled.', 'bot');
        });
    } else {
        addMessage('Geolocation is not supported by your browser.', 'bot');
    }
}

// Function to calculate and display the route
function calculateAndDisplayRoute(origin, destinationParam) {
    directionsService.route({
        origin: origin,
        destination: destinationParam,
        travelMode: google.maps.TravelMode.DRIVING
    }, (response, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);

            // --- NEW CODE START ---
            // Construct the Google Maps URL
            const originString = `${origin.lat},${origin.lng}`;
            const encodedOrigin = encodeURIComponent(originString);
            const encodedDestination = encodeURIComponent(destinationParam);
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDestination}`;

            // Create the message with the link
            const linkMessage = `You can also view this route directly on Google Maps: <a href="${googleMapsUrl}" target="_blank">Open Google Maps</a>.`;
            addMessage(linkMessage, 'bot');
            // --- NEW CODE END ---

            addMessage("Where would you like to go next?", 'bot');
            destination = '';

        } else {
            window.alert('Directions request failed due to ' + status);
            addMessage('Sorry, I could not calculate the directions for that location. Please enter a new destination.', 'bot');
            destination = '';
        }
    });
}


// Event listeners
sendBtn.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleUserInput();
    }
});