interface HappinessParams {
  start: string
  end: string
  period: string
  zoomLevel: number
}

const fetchData = async (
  url: string,
  token: string,
  params: HappinessParams,
): Promise<any> => {
  try {
    const query = new URLSearchParams({
      start: params.start,
      end: params.end,
      period: params.period,
      zoomLevel: params.zoomLevel.toString(),
    })
    const response = await fetch(`${url}?${query}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    const jsonData = await response.json()
    return jsonData
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

export default fetchData
