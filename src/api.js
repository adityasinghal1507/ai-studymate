export async function postJson(path, body) {
  let response;

  try {
    response = await fetch(`http://localhost:5000${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(90000),
      body: JSON.stringify(body),
    });
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw new Error("Gemini is taking too long to respond. Please try again.");
    }

    throw new Error("Unable to connect to the AI server.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "The AI request failed.");
  }

  return data;
}
