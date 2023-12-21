console.log("chatbot.js script running");

function initChatbot() {
    const chatbotContainer = document.getElementById('chatbot-container');
    chatbotContainer.innerHTML = `
        <div id="messages" style="margin-bottom: 10px;"></div>
        <input type="text" id="userInput" placeholder="Type a message..." style="width: 100%;" />
        <button id="sendButton">Send</button>
    `;

    const userInput = document.getElementById('userInput');
    const messages = document.getElementById('messages');
    const sendButton = document.getElementById('sendButton');

    sendButton.addEventListener('click', () => {
        const query = userInput.value;
        if (query.trim() === '') return;
        messages.innerHTML += `<div class="user-message">${query}</div>`;
        userInput.value = '';

        if (query) {
            const apiKey = "insert API key here";
            const apiUrl = "https://api.openai.com/v1/chat/completions";

            fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {"role": "system", "content": "You are a helpful assistant."},
                        {"role": "user", "content": query}
                    ]
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.choices && data.choices.length > 0) {
                    const ans = data.choices[0].message.content;
                    const div = document.createElement('div');
                    div.innerText = ans;
                    div.style.position = 'fixed';
                    div.style.bottom = '0';
                    div.style.width = '100%';
                    div.style.backgroundColor = 'white';
                    div.style.textAlign = 'center';
                    div.style.padding = '10px';
                    div.style.boxShadow = '0px -2px 10px rgba(0, 0, 0, 0.1)';
                    div.style.zIndex = '10000';
                    document.body.appendChild(div);

                } else {
                    console.error('No choices available in the response:', data);
                }

            })
            .catch(error => console.error(error));
        } else {
            console.log("No search query found.");
        }


        // Getting the extension ID
        const extensionId = chrome.runtime.id;

        // // Sending message to background script
        // chrome.runtime.sendMessage({ action: "fetchResponse", query }, (response) => {
        //     console.log("Debugger: " + response)

        //     if (response && response.error) {
        //         messages.innerHTML += `<div class="bot-message">Error: ${response.error}</div>`;
        //     } else if (response && response.response) {
        //         messages.innerHTML += `<div class="bot-message">${response.response}</div>`;
        //     } else {
        //         console.error("Invalid response from background script:", response);
        //         messages.innerHTML += `<div class="bot-message">Error: Invalid response from background script</div>`;
        //     }
        // });
    });
}

if (document.readyState === 'complete') {
    initChatbot();
} else {
    window.onload = initChatbot;
}
