interface Happiness {
  latitude: number
  longitude: number
  answers: {
    happiness1: number
    happiness2: number
    happiness3: number
    happiness4: number
    happiness5: number
    happiness6: number
  }
}

const postData = async (
  url: string,
  requestBody: Happiness,
  token: string
): Promise<any> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        // TODO: デモ用にngrokの確認画面を非表示
        'ngrok-skip-browser-warning': 'value',
      },
      body: JSON.stringify(requestBody),
    })
    const jsonData = await response.json()
    return jsonData
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

export default postData
