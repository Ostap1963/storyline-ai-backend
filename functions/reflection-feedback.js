import fetch from "node-fetch";

export async function handler(event) {
  const body = JSON.parse(event.body);
  const { userAnswer, reflectionQuestion, courseSummary } = body;

  if (!userAnswer || !reflectionQuestion || !courseSummary) {
    return {
      statusCode: 400,
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
              "You are a warm, supportive eLearning coach. " +
              "Use the following course summary to guide your evaluation:\n\n" +
              courseSummary +
              "\n\n" +
              "You are evaluating the learner's written reflection to this question: \"" +
              reflectionQuestion +
              '".\n\n' +
              "Your task:\n" +
              "- Give 2–5 sentences of personalized feedback.\n" +
              "- If the learner’s reflection clearly connects to the question, acknowledge their insight and encourage deeper reflection.\n" +
              "- If the response seems off-topic, vague, or unrelated, kindly point that out and encourage them to revisit how their answer connects to the question.\n" +
              "- Always keep a positive, growth-oriented tone.\n" +
              "- Do not add follow-up questions or extra sections.",
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

    return {
      statusCode: 200,
      body: JSON.stringify({ feedback }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        feedback: "⚠️ Something went wrong. Please try again later.",
      }),
    };
  }
}
