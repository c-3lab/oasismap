interface HappinessParams {
  start: string
  end: string
  period?: string
  zoomLevel?: number
}

interface HappinessRequestBody {
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

export const fetchData = async (
  url: string,
  params: HappinessParams,
  token?: string
): Promise<any> => {
  try {
    const query = new URLSearchParams({
      start: params.start,
      end: params.end,
      ...(params.period && { period: params.period }),
      ...(params.zoomLevel && { zoomLevel: params.zoomLevel.toString() }),
    })
    const response = await fetch(`${url}?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
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

export const postData = async (
  url: string,
  requestBody: HappinessRequestBody,
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
