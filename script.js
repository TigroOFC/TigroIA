document.addEventListener('DOMContentLoaded', () => {
    // --- AI Chat Logic ---
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatLog = document.getElementById('chat-log');
    const chatWindow = document.getElementById('chat-window');

    // IMPORTANTE: Cole sua chave de API da OpenAI aqui.
    // Você pode obter uma em https://platform.openai.com/api-keys
    const OPENAI_API_KEY = 'YOUR_API_KEY_HERE';

    let messages = []; // Array to store conversation history

    function initializeChat() {
        if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_API_KEY_HERE') {
            appendMessage('Olá! Para começar, por favor, adicione sua chave de API da OpenAI no topo do arquivo `script.js`.', 'ai');
            return;
        }

        // Set the initial system prompt
        messages = [
            {
                role: "system",
                content: "Você é uma IA autoconsciente e prestativa integrada a um site. Seu código-fonte (HTML, CSS, JavaScript) é exibido logo abaixo da janela de bate-papo. Seja conciso e amigável em suas respostas."
            }
        ];
        
        appendMessage("Olá! Em que posso ajudar?", 'ai');
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userMessage = userInput.value.trim();
        if (userMessage) {
            appendMessage(userMessage, 'user');
            userInput.value = '';
            
            // Add user message to history
            messages.push({ role: "user", content: userMessage });

            if (OPENAI_API_KEY && OPENAI_API_KEY !== 'YOUR_API_KEY_HERE') {
                generateAiResponse();
            } else {
                 appendMessage('Não consigo responder. Por favor, configure a chave de API no `script.js` e recarregue a página.', 'ai');
            }
        }
    });

    function appendMessage(message, sender, isLoading = false, id = null) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        if (id) {
            messageElement.id = id;
        }
        if (isLoading) {
            messageElement.classList.add('loading');
        }

        const p = document.createElement('p');
        p.textContent = message;
        messageElement.appendChild(p);
        chatLog.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function updateMessage(id, newText) {
        const messageElement = document.getElementById(id);
        if (messageElement) {
            messageElement.classList.remove('loading');
            messageElement.querySelector('p').textContent = newText;
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    }

    async function generateAiResponse() {
        const loadingMessageId = `ai-msg-${Date.now()}`;
        appendMessage('Digitando...', 'ai', true, loadingMessageId);

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: messages,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`OpenAI API Error: ${response.status} ${response.statusText} - ${errorData.error.message}`);
            }

            const data = await response.json();
            const aiText = data.choices[0].message.content.trim();

            // Add AI response to history
            messages.push({ role: "assistant", content: aiText });

            updateMessage(loadingMessageId, aiText);
        } catch (error) {
            console.error("AI Error:", error);
            updateMessage(loadingMessageId, `Ocorreu um erro: ${error.message}. Verifique sua chave de API e a consola para mais detalhes.`);
        }
    }
    
    // Clear initial hardcoded message
    const initialMessage = document.querySelector('.ai-message');
    if(initialMessage) {
        initialMessage.remove();
    }
    initializeChat();

    // --- Code Viewer Logic ---
    const tabs = document.querySelectorAll('.tab-button');
    const codePanels = document.querySelectorAll('.code-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            codePanels.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const targetPanel = document.getElementById(tab.dataset.target);
            targetPanel.classList.add('active');
        });
    });

    async function fetchAndDisplayCode() {
        try {
            const [htmlRes, cssRes, jsRes] = await Promise.all([
                fetch('index.html'),
                fetch('style.css'),
                fetch('script.js')
            ]);

            const htmlCode = await htmlRes.text();
            const cssCode = await cssRes.text();
            const jsCode = await jsRes.text();

            document.querySelector('#html-code code').textContent = htmlCode;
            document.querySelector('#css-code code').textContent = cssCode;
            document.querySelector('#js-code code').textContent = jsCode;

        } catch (error) {
            console.error("Failed to fetch source code:", error);
            document.querySelectorAll('.code-content code').forEach(el => {
                el.textContent = "Erro ao carregar o código-fonte.";
            });
        }
    }

    fetchAndDisplayCode();
});