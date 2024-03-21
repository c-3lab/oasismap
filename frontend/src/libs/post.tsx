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
      },
      body: JSON.stringify(requestBody),
    })
    const jsonData = await response.json()

    if (response.status >= 400) {
      throw Error(jsonData)
    }
    return jsonData
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

export default postData
