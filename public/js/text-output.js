function stretchText() {
    const container = document.querySelector('.container');
    const text = document.querySelector('.text');

    // Trigger reflow
    text.offsetHeight;

    const containerWidth = container.offsetWidth;
    const textWidth = text.scrollWidth;
    const scaleWidth = containerWidth / textWidth;

    const containerHeight = container.offsetHeight;
    const textHeight = text.scrollHeight;
    const scaleHeight = containerHeight / textHeight;

    if (text.innerHTML.length > 30) {
        text.style.transform = `scale(${scaleWidth}, ${scaleHeight})`;
    } else {
        text.style.transform = `scale(${scaleHeight}, ${scaleHeight})`;
    }
}

const dataDisplay = document.getElementById('dataDisplay');

function animateText() {
    return new Promise((resolve) => {
        dataDisplay.classList.add('fade-out');
        setTimeout(() => {
            // Wait for the fade-out animation to complete
            dataDisplay.classList.remove('fade-out');
            // Process the message
            resolve();
        }, 500); // Duration of the fade-out animation
    }).then(() => {
        // Process the message and then fade in
        requestAnimationFrame(stretchText);
        dataDisplay.classList.add('fade-in');
        setTimeout(() => {
            // Wait for the fade-in animation to complete
            dataDisplay.classList.remove('fade-in');
        }, 500); // Duration of the fade-in animation
    });
}

// Call stretchText on load and on window resize
window.addEventListener('load', stretchText);
window.addEventListener('resize', stretchText);

const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const ws = new WebSocket(`${wsProtocol}://${window.location.host}`);

// Display incoming messages from the server
ws.onmessage = (message) => {
    const data = message.data;

    if (data instanceof Blob) {
        // Create a FileReader to read the Blob
        const reader = new FileReader();

        reader.onload = () => {
            // The result is a string containing the JSON data
            const jsonString = reader.result;
            try {
                // Parse the JSON string into an array
                dataArray = JSON.parse(jsonString);
                console.log('Received array data:', dataArray);
                animateText().then(() => {
                    dataDisplay.textContent = `${dataArray[0]}`;
                });
            } catch (error) {
                console.error('Failed to parse JSON:', error);
            }
        };

        // Read the Blob as text
        reader.readAsText(data);
    } else {
        console.error('Received non-Blob data:', event.data);
    }
};

ws.onopen = () => {
    console.log('Connected to WebSocket server');
};

ws.onclose = () => {
    console.log('Disconnected from WebSocket server');
};
