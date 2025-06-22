export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { prompt } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'Missing OpenAI API Key' });
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  const systemPrompt = `
You are an app component generator. Given a user prompt, return a JSON with React components, including:

- name
- description
- code (JavaScript, React, styled with Tailwind CSS)
- explanation (as an array of simple line-by-line insights)

Respond ONLY in JSON format.
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${apiKey}\`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();
    const raw = data.choices[0]?.message?.content;

    // Try parsing AI output to JSON
    const parsed = JSON.parse(raw);
    res.status(200).json(parsed);

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to generate components" });
  }
}

