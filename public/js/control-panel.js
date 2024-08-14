const ws = new WebSocket('ws://localhost:3000');

const moduleContainer = document.querySelector('.module-container')

const moduleAdd = document.getElementById('moduleAdd');
const exportJSON = document.getElementById('exportJSON');
const importJSON = document.getElementById('importJSON');

function readFile(input, callback) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            callback(reader.result);
        };
        reader.readAsDataURL(file);
    } else {
        callback(null); // Handle case where no file is selected
    }
}

function createModule() {
    // FIX TEMPLATE NOT FOUND -- tempory fix getElementById existing module
    const templateModule = document.querySelector(".module");
    if (templateModule) {
        var cloneModule = templateModule.cloneNode(true);

        moduleContainer.appendChild(cloneModule);
    } else {
        console.error('Template element not found.');
    }
}

function refreshModules() {
    const modules = document.querySelectorAll('.module');

    modules.forEach((module, i) => {
        const deleteButton = module.querySelector('.delete-button');
        const idNumber = module.querySelector('.id-number');
        const inputText = module.querySelector('input[type="text"]');
        const inputFile = module.querySelector('input[type="file"]');
        const outputImg = module.querySelector('img');
        const sendButton = module.querySelector('.send-button');

        module.setAttribute("id", `module${i}`);

        idNumber.textContent = `# ${i}`;

        inputText.setAttribute("id", `inputText${i}`);

        inputFile.setAttribute("id", `inputFile${i}`);
        inputFile.addEventListener('click', () => {
            inputFile.value = null;
            readFile(inputFile, (result) => {
                outputImg.setAttribute("src", "");
                console.log(`File removed from ${inputFile.getAttribute("id")}`);
            });
        });

        // Detect when file is uploaded
        inputFile.addEventListener('change', () => {
            readFile(inputFile, (result) => {
                outputImg.setAttribute("src", result);
                console.log(`File uploaded to ${inputFile.getAttribute("id")}`);
            });
        });

        // Send corresponding input data to the server when the send button is clicked
        sendButton.addEventListener('click', () => {
            const targetTextInput = document.getElementById(`inputText${i}`);
            const targetFileInput = document.getElementById(`inputFile${i}`);
            console.log(targetFileInput);
            let data;

            readFile(targetFileInput, (result) => {
                data = [targetTextInput.value, result];
                ws.send(JSON.stringify(data));
                console.log(JSON.stringify(data));
            });
        });

        // Handle module deletion when the delete button is clicked
        deleteButton.addEventListener('click', () => {
            module.remove();
            refreshModules(); // Re-index modules after deletion
        });
    });
}

// Export functionality
exportJSON.addEventListener('click', () => {
    const modules = document.querySelectorAll('.module');
    let modulesJSON = [];

    modules.forEach((module, i) => {
        const inputText = module.querySelector('input[type="text"]');
        const inputFile = module.querySelector('input[type="file"]');
        const outputImg = module.querySelector('img');

        modulesJSON.push({
            "id": module.id,
            "inputText": inputText.value,
            "inputFile": inputFile.files[0] ? inputFile.files[0].name : null, // Only storing file name for simplicity
            "outputImg": outputImg.getAttribute("src")
        });
    });

    const jsonString = JSON.stringify(modulesJSON, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'modules.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    console.log('Modules exported to modules.json');
});

// Import functionality
importJSON.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const json = JSON.parse(e.target.result);
                moduleContainer.innerHTML = ''; // Clear existing modules

                json.forEach((moduleData, index) => {
                    createModuleFromData(moduleData, index);
                });

                refreshModules(); // Refresh to re-apply event listeners
            };
            reader.readAsText(file);
        }
    });

    fileInput.click();
});

function createModuleFromData(data, index) {
    const module = document.createElement('div');
    module.className = 'module';
    module.id = `module${index}`;

    module.innerHTML = `
        <button class="delete-button">-</button>
        <div class="id-number"># ${index}</div>
        <input type="text" id="inputText${index}" value="${data.inputText}" placeholder="Enter text">
        <input type="file" id="inputFile${index}" accept="image/*">
        <img id="outputImg${index}" src="${data.outputImg}" alt="NO IMAGE">
        <button class="send-button">Send</button>
    `;

    console.log(module);

    moduleContainer.appendChild(module);
}


moduleAdd.addEventListener('click', () => {
    createModule();
    refreshModules();
})

// ws.onmessage = function(event) {};

ws.onopen = () => {
    console.log('Connected to WebSocket server');
    refreshModules();
};

ws.onclose = () => {
    console.log('Disconnected from WebSocket server');
};