export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { code } = req.body;
  const { CODA_API_TOKEN, CODA_DOC_ID, CODA_TABLE_ID } = process.env;

  if (!CODA_API_TOKEN || !CODA_DOC_ID || !CODA_TABLE_ID) {
    return res.status(500).json({ error: "Variáveis de ambiente não configuradas" });
  }

  try {
    const response = await fetch(
      `https://coda.io/apis/v1/docs/${CODA_DOC_ID}/tables/${CODA_TABLE_ID}/rows`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CODA_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rows: [
            {
              cells: [
                { column: "Scanner", value: code } // coluna principal
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro do Coda: ${errorText}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
