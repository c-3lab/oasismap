interface HappinessParams {
  start: string
  end: string
  period?: string
  zoomLevel?: number
}

const fetchData = async (
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
        // TODO: デモ用にngrokの確認画面を非表示
        'ngrok-skip-browser-warning': 'value',
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
