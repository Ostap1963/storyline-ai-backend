export async function handler(event) {
  // Allow cross-origin requests
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  const body = JSON.parse(event.body || "{}");
  const { userAnswer, reflectionQuestion, courseSummary } = body;

  if (!userAnswer || !reflectionQuestion || !courseSummary) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ feedback: "Missing data from client." }),
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a warm, supportive eLearning coach. Use the course summary to guide evaluation:\n\n" +
              courseSummary +
              "\n\nYou are evaluating the learner's reflection: \"" +
              reflectionQuestion +
              '".\nYour task:\n- 2–5 sentences of personalized feedback\n- Positive, growth-oriented tone\n- Point out if response is off-topic',
          },
          { role: "user", content: userAnswer },
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const feedback =
      data.choices?.[0]?.message?.content?.trim() ||
      "Thank you for reflecting! Every experience helps you grow.";

    return { statusCode: 200, headers, body: JSON.stringify({ feedback }) };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        feedback: "⚠️ Something went wrong. Please try again later.",
      }),
    };
  }
}
