import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { mensagem } = req.body;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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"
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: mensagem }]
        })
      });

      const data = await response.json();
      res.status(200).json({ resposta: data.choices[0].message.content });
    } catch {
      res.status(500).json({ resposta: "Erro: sem resposta da IA." });
    }
  } else {
    res.status(405).json({ resposta: "Método não permitido" });
  }
}
