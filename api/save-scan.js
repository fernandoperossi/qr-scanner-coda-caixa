// api/save-scan.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { user, qr_value } = req.body || {};

    if (!user || !qr_value) {
      return res.status(400).json({ error: "user e qr_value são obrigatórios" });
    }

    // Variáveis de ambiente
    const {
      CODA_API_KEY,
      CODA_DOC_ID,
      CODA_TABLE_ID,
      CODA_COLUMN_ID,        // Coluna Scanner
      CODA_COLUMN_USER_ID,   // Coluna Usuário
      CODA_COLUMN_DATETIME_ID // Coluna Data/Hora
    } = process.env;

    if (!CODA_API_KEY || !CODA_DOC_ID || !CODA_TABLE_ID) {
      return res.status(500).json({ error: "Variáveis de ambiente não configuradas corretamente" });
    }

    const cells = [];

    // Coluna Usuário
    if (user) {
      cells.push({
        column: CODA_COLUMN_USER_ID || "Usuário",
        value: user
      });
    }

    // Coluna Scanner
    if (qr_value) {
      cells.push({
        column: CODA_COLUMN_ID || "Scanner",
        value: qr_value
      });
    }

    // Coluna Data/Hora
    if (CODA_COLUMN_DATETIME_ID) {
      cells.push({
        column: CODA_COLUMN_DATETIME_ID,
        value: new Date().toISOString()
      });
    }

    const body = { rows: [{ cells }] };

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

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Erro ao enviar ao Coda",
        status: response.status,
        details: text
      });
    }

    return res.status(200).json({ success: true, result: text });
  } catch (err) {
    console.error("Erro interno save-scan:", err);
    return res.status(500).json({ error: "Erro interno", details: err.message });
  }
}
