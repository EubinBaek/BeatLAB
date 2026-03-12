const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { texts, target_lang } = await req.json();

    if (!texts?.length || !target_lang) {
      return new Response(JSON.stringify({ translations: [] }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const langNames: Record<string, string> = {
      en: "English", es: "Spanish", fr: "French", ko: "Korean",
      zh: "Chinese (Simplified)", ja: "Japanese", de: "German",
    };

    const targetName = langNames[target_lang] || target_lang;

    const prompt = `Translate the following UI texts to ${targetName}.
Return ONLY a JSON object in this exact format: { "translations": ["...", "...", ...] }
The array must have exactly ${texts.length} items, in the same order as the input.
Preserve any special characters and formatting exactly.
Do not add explanations outside the JSON.

Input texts (JSON array):
${JSON.stringify(texts)}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4000,
        response_format: { type: "json_object" },
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "OpenAI error");

    const content = JSON.parse(data.choices[0].message.content);
    const translations: string[] = Array.isArray(content.translations)
      ? content.translations
      : Object.values(content);

    return new Response(JSON.stringify({ translations }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
