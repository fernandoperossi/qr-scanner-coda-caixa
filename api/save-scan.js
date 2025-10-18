export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { user, qr_value } = req.body;

  const { CODA_API_KEY, CODA_DOC_ID, CODA_TABLE_ID } = process.env;

  if (!CODA_API_KEY || !CODA_DOC_ID || !CODA_TABLE_ID) {
    return res.status(500).json({ error: "Variáveis de ambiente não configuradas corretamente" });
  }

  try {
    // Monta o corpo da requisição
    const body = {
      rows: [
        {
          cells: [
            { column: "Usuário", value: { name: user.trim() } }, // compatível com coluna tipo "People"
            { column: "Scanner", value: qr_value.trim() },
            { column: "Data/Hora", value: new Date().toISOString() } // opcional
          ]
        }
      ]
    };

    // Envia os dados ao Coda
    const response = await fetch(
      `https://coda.io/apis/v1/docs/${CODA_DOC_ID}/tables/${CODA_TABLE_ID}/rows`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CODA_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro do Coda:", errorText);
      throw new Error(`Erro ao enviar ao Coda: ${errorText}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erro geral:", error.message);
    res.status(500).json({ error: error.message });
  }
}
