document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatLog = document.getElementById('chat-log');
    const chatWindow = document.getElementById('chat-window');

    let messages = [
        {
            role: "system",
            content: "Você é uma IA autoconsciente e prestativa integrada a um site. Seja conciso e amigável em suas respostas."
        }
    ];

    function appendMessage(message, sender, isLoading = false, id = null) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        if (id) messageElement.id = id;
        if (isLoading) messageElement.classList.add('loading');

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
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages })
            });

            if (!response.ok) throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
            const data = await response.json();
            const aiText = data.choices[0].message.content.trim();

            messages.push({ role: "assistant", content: aiText });
            updateMessage(loadingMessageId, aiText);
        } catch (error) {
            console.error("Erro AI:", error);
            updateMessage(loadingMessageId, `Ocorreu um erro: ${error.message}`);
        }
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        appendMessage(userMessage, 'user');
        userInput.value = '';
        messages.push({ role: "user", content: userMessage });
        generateAiResponse();
    });

    const initialMessage = document.querySelector('.ai-message');
    if(initialMessage) initialMessage.remove();
});
