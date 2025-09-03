import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    const { messages } = req.body;

    try {
        // Verifica se a chave da OpenAI está definida
        if (!process.env.OPENAI_API_KEY) {
            console.error("Erro: OPENAI_API_KEY não definida");
            return res.status(500).json({ error: "OPENAI_API_KEY não definida" });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages,
                max_tokens: 500
            })
        });

        // Se a resposta da OpenAI não for 200, lança erro com detalhes
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro OpenAI:", errorData);
            return res.status(response.status).json({ error: errorData });
        }

        const data = await response.json();
        res.status(200).json(data);

    } catch (err) {
        console.error("Erro na API serverless:", err);
        res.status(500).json({ error: err.message });
    }
}
