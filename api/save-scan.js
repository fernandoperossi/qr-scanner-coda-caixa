export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { user, qr_value } = req.body;
  const { CODA_API_KEY, CODA_DOC_ID, CODA_TABLE_ID, CODA_COLUMN_ID } = process.env;

  if (!CODA_API_KEY || !CODA_DOC_ID || !CODA_TABLE_ID || !CODA_COLUMN_ID) {
    return res.status(500).json({ error: "Variáveis de ambiente não configuradas corretamente" });
  }

  try {
    const response = await fetch(
      `https://coda.io/apis/v1/docs/${CODA_DOC_ID}/tables/${CODA_TABLE_ID}/rows`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CODA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rows: [
            {
              cells: [
                { column: CODA_COLUMN_ID, value: `${user} - ${qr_value}` }
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
    console.error("Erro ao salvar no Coda:", error.message);
    res.status(500).json({ error: error.message });
  }
}
