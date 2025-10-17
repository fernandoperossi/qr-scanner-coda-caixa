export default async function handler(req, res) {
  const { card, user } = req.query;

  // Variáveis armazenadas no painel da Vercel (Environment Variables)
  const CODA_API_TOKEN = process.env.CODA_API_TOKEN;
  const CODA_DOC_ID = process.env.CODA_DOC_ID;
  const CODA_TABLE_ID = process.env.CODA_TABLE_ID;

  // ID da coluna onde o valor será salvo (fixo no código)
  const COLUMN_ID = "c-c2KFsNnkvh"; // <-- Substitua pelo ID real da coluna no seu Coda

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
                { column: COLUMN_ID, value: card },
                { column: "c-UserName", value: user } // opcional: salva o nome do usuário
              ]
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(400).json({ error: err });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
