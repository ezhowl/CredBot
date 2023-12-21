console.log("chatbot.js script running");

const url = new URL(window.location.href);
const urlLink = url.href;
const websiteText = document.body.innerText;

let conversationHistory = [];
let credibilityResult = ""; // This will hold the full credibility analysis

function updateConversation(role, content) {
    conversationHistory.push({ "role": role, "content": content });
}

function setCredibilityIndicator(credibilityLevel) {
    const chatbotContainer = document.getElementById('chatbot-container');
    chatbotContainer.className = ''; // Clear all previous classes
    chatbotContainer.classList.add(`${credibilityLevel}-credibility`);
}


function displayCredibilityMessage(credibilityLevel) {
    const messages = document.getElementById('messages');
    messages.innerHTML = ""; // Clear previous messages

    let credibilityMessage = "";
    switch (credibilityLevel) {
        case 'low':
            credibilityMessage = "Warning: This website may have serious credibility issues.";
            break;
        case 'medium':
            credibilityMessage = "Notice: This website may have some credibility issues";
            break;
        case 'high':
            credibilityMessage = "I evaluated the credibility of this website. Would you like to see the results?";
            break;

        case 'medical':
            credibilityMessage = "Misinformation Warning: Be cautious with medical information on this site and consult healthcare professionals.";
            break;

        default:
            credibilityMessage = "Credibility analysis underway.";
            break;
    }

    // Create a container for the credibility message and button
    const messageContainer = document.createElement("div");
    messageContainer.className = `${credibilityLevel}-message message-container`;
    messageContainer.innerHTML = credibilityMessage;

    // Add the message container to the messages div
    messages.appendChild(messageContainer);

    // Create the "See More" button
    const seeMoreButton = document.createElement("button");
    seeMoreButton.id = "seeMoreButton";
    seeMoreButton.textContent = "See More";
    seeMoreButton.onclick = function() {
        // Append the full credibility response and remove the button
        const fullMessageDiv = document.createElement("div");
        fullMessageDiv.className = "bot-message";
        fullMessageDiv.innerHTML = credibilityResult;
        messages.appendChild(fullMessageDiv);
        seeMoreButton.remove();
    };

    // Append the button to the message container
    messageContainer.appendChild(seeMoreButton);
}


function initChatbot() {
    const chatbotContainer = document.createElement('div');
    chatbotContainer.id = 'chatbot-container';
    document.body.appendChild(chatbotContainer);

    chatbotContainer.innerHTML = `
    <div id="messages" style="margin-bottom: 10px;"></div>
    <div id="input-area" class="clearfix">
        <input type="text" id="userInput" placeholder="Type a message..." style="width: 80%; float: left;" />
        <button id="sendButton" style="float: right;">Send</button>
    </div>
    `;

    const userInput = document.getElementById('userInput');
    const messages = document.getElementById('messages');
    const sendButton = document.getElementById('sendButton');

    sendButton.addEventListener('click', () => {
        const query = userInput.value;
        if (query.trim() === '') return;
        messages.innerHTML += `<div class="user-message">${query}</div>`;
        userInput.value = '';

        updateConversation("user", query);
        debugger;
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
                    "messages": conversationHistory
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.choices && data.choices.length > 0) {
                    const ans = data.choices[0].message.content;
                    updateConversation("assistant", ans);
                    messages.innerHTML += `<div class="bot-message">${ans}</div>`;
                } else {
                    console.error('No choices available in the response:', data);
                    messages.innerHTML += `<div class="bot-message">Error: No choices available in the response</div>`;
                }
            })
            .catch(error => {
                console.error(error);
                messages.innerHTML += `<div class="bot-message">Error: ${error.message}</div>`;
            });
        } else {
            console.log("No search query found.");
        }
    });

    // Fetch the initial credibility assessment when the chatbot is initialized
    fetchCredibilityAssessment();
}

function fetchCredibilityAssessment() {
    const messages = document.getElementById('messages');
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
                {
                    "role": "system",
                    "content": "You are a professional assistant meant to help users determine the credibility of the website " +
                    "they are currently on. Evaluate the credibility of the website passed to you, as well as any questions the user has in less " +
                    "than 10 sentences. The credibility of the website should be evaluated in 5 clearly-labeled and numbered criteria: disclosure of authorship, disclosure of " +
                    "ownership, ad volume, number of external ads, and type of organization (nonprofit, government, for-profit etc). In your first sentence, clearly state whether " +
                    "this website has high, medium, or low credibility. Then, display your credibility message in " +
                    "these 5 criteria, clearly numbered and labeled. Know that CNN has medium ad volume. Then, evaluate if there is potential bias in the website's text passed to you. Ask the user if it would like to learn more " +
                    "about the results and answer any questions the user might have. Keep every response to ten sentences."},
                {
                    "role": "user",
                    "content": urlLink
                },
                {
                    "role": "user",
                    "content": websiteText
                }
            ]
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.choices && data.choices.length > 0) {
            const ans = data.choices[0].message.content;
            credibilityResult = ans; // Save the full message
            updateConversation("assistant", ans);

            // Determine the credibility level based on the response
            let credibilityLevel = "high"; // Default to high to ensure some message is shown
            if (ans.toLowerCase().includes('low credibility')) {
                credibilityLevel = 'low';
            } else if (ans.toLowerCase().includes('medium credibility')) {
                credibilityLevel = 'medium';
            } else if (ans.toLowerCase().includes('high credibility')) {
                credibilityLevel = 'high';
            }
            setCredibilityIndicator(credibilityLevel); // Set the indicator visually
            displayCredibilityMessage(credibilityLevel); // Display the appropriate message
        } else {
            messages.innerHTML += '<div class="bot-message">Error: Unable to evaluate website credibility at this time.</div>';
        }
    })
    .catch(error => {
        messages.innerHTML += `<div class="bot-message">Error: ${error.message}</div>`;
    });
}

if (document.readyState === 'complete') {
    //if url == these urls, then run initChatbot();
    initChatbot();
} else {
    window.onload = initChatbot;
}
