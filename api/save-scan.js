// api/save-scan.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { user, qr_value } = req.body || {};

  const {
    CODA_API_KEY,
    CODA_DOC_ID,
    CODA_TABLE_ID,
    CODA_COLUMN_ID,        // Column ID da coluna Scanner (ex: c-c2KFsNnkvh)
    CODA_COLUMN_USER_ID,   // Column ID da coluna Usuário (people) - opcional
    CODA_COLUMN_DATETIME_ID // Column ID da coluna Data/Hora - opcional
  } = process.env;

  if (!CODA_API_KEY || !CODA_DOC_ID || !CODA_TABLE_ID) {
    return res.status(500).json({ error: "Variáveis de ambiente não configuradas corretamente" });
  }

  // Resolve o identificador da coluna a usar: prefere Column ID, senão nome literal
  const scannerColumn = CODA_COLUMN_ID || "Scanner";
  const userColumn = CODA_COLUMN_USER_ID || "Usuário";
  const dateColumn = CODA_COLUMN_DATETIME_ID || "Data/Hora";

  // Normaliza valores como string (remove espaços nas pontas)
  const userValue = (user || "").toString();
  const qrValue = (qr_value || "").toString().trim();
  const nowValue = new Date().toISOString();

  // Monta as células - envia apenas valores primitivos (strings)
  const cells = [];

  // adiciona usuário somente se houver
  if (userValue) {
    cells.push({ column: userColumn, value: userValue });
  }

  // adiciona o QR (sempre)
  cells.push({ column: scannerColumn, value: qrValue });

  // adiciona data/hora se desejar
  if (dateColumn) {
    cells.push({ column: dateColumn, value: nowValue });
  }

  const body = { rows: [ { cells } ] };

  try {
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
      // retorna erro com detalhe do Coda para depuração
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
