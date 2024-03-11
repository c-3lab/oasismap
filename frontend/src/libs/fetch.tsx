const fetchData = async (url: string): Promise<any> => {
  try {
    const response = await fetch(url, {
      method: 'GET',
    })
    const jsonData = await response.json()
    return jsonData
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

export default fetchData
