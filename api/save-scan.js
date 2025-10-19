export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const {
    CODA_API_KEY,
    CODA_DOC_ID,
    CODA_TABLE_ID,
    CODA_COLUMN_ID,
    CODA_COLUMN_USER_ID,
    CODA_COLUMN_DATETIME_ID,
  } = process.env;

  try {
    const { qrCodeData, user } = req.body;

    if (!qrCodeData || !user) {
      return res.status(400).json({ error: "qrCodeData e user são obrigatórios" });
    }

    // 🔹 Corrige o problema dos espaços removidos — decodeURIComponent
    const decodedUser = decodeURIComponent(user);

    // 🔹 Prepara o payload com os tipos corretos
    const payload = {
      rows: [
        {
          cells: [
            { column: CODA_COLUMN_ID, value: qrCodeData },
            { column: CODA_COLUMN_USER_ID, value: [decodedUser] }, // <- Envia como array
            { column: CODA_COLUMN_DATETIME_ID, value: new Date().toISOString() },
          ],
        },
      ],
    };

    // 🔹 Envia para o Coda
    const response = await fetch(
      `https://coda.io/apis/v1/docs/${CODA_DOC_ID}/tables/${CODA_TABLE_ID}/rows`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CODA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Erro ao enviar ao Coda: ${JSON.stringify({
          status: response.status,
          details: data,
        })}`
      );
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Erro ao salvar no Coda:", error);
    res.status(500).json({ error: error.message });
  }
}
