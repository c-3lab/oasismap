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
  token: string
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
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
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

export const download = async (url: string, token: string) => {
  try {
    const response = await fetch(`${url}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.status >= 400) {
      const jsonData = await response.json()
      throw Error(jsonData)
    }

    const fileName = getFileName(response) || 'export.csv'
    const blob = new Blob([await response.blob()])
    const objectUrl = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = objectUrl
    link.download = fileName
    link.click()

    // Firefoxで問題になるため、処理を待ってからObjectURLを失効させる
    setTimeout(() => {
      window.URL.revokeObjectURL(objectUrl)
    }, 250)
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

const getFileName = (response: Response) => {
  const disposition = response.headers.get('Content-Disposition') || ''
  if (disposition) {
    const pattern = /filename=(['"])(.*?)\1/
    const matches = pattern.exec(disposition)
    if (matches) {
      return matches[2]
    }
  }
}
