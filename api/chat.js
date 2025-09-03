const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const { mensagem, plano } = req.body;
  let freeCount = 0;
  const FREE_LIMIT = 100;

  const OPENAI_KEY = "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";

  if (plano === "free" && freeCount >= FREE_LIMIT) {
    res.json({ resposta: "Limite da versão Free atingido." });
    return;
  }
  if (plano === "free") freeCount++;

  try {
    const respostaAPI = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: plano === "pro" ? "gpt-4" : "gpt-3.5-turbo",
        messages: [{ role: "user", content: mensagem }]
      })
    });

    const data = await respostaAPI.json();
    res.json({ resposta: data.choices[0].message.content });

  } catch (err) {
    res.json({ resposta: "Erro ao se comunicar com a IA." });
  }
};
