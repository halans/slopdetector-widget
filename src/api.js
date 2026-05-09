export async function fetchSlopScore(text) {
  try {
    const response = await fetch('https://api.slopdetector.me/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('SlopDetector API Error:', error);
    return null;
  }
}
