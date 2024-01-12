import { envData } from './../App';

const get = async (url, jwtToken) => {
  const getResult = await fetch(`${envData.apiURL}${url}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`,
      'Trace': generateTraceID()
    },
  })
  const readableResult = await getResult.json()
  if (!getResult.ok) {
    throw `Get request error : code=${getResult.status}, error_code=${readableResult.error_code} message=${readableResult.error_message}`
  }
  return readableResult.data
}

const getQuery = async (url, jwtToken, params) => {
  const getResult = await fetch(`${envData.apiURL}${url}?${new URLSearchParams(params)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`,
      'Trace': generateTraceID()
    },
  })
  const readableResult = await getResult.json()
  if (!getResult.ok) {
    throw `Get request query error : code=${getResult.status}, error_code=${readableResult.error_code} message=${readableResult.error_message}`
  }
  return readableResult.data
}

const post = async (url, jwtToken, data) => {
  const postResult = await fetch(`${envData.apiURL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`,
      'Trace': generateTraceID()
    },
    body: JSON.stringify(data)
  })
  const readableResult = await postResult.json()
  if (!postResult.ok) {
    throw `Get request query error : code=${postResult.status}, error_code=${readableResult.error_code} message=${readableResult.error_message}`
  }
  return readableResult.data
}

const put = async (url, jwtToken, data) => {
  const putResult = await fetch(`${envData.apiURL}${url}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`,
      'Trace': generateTraceID()
    },
    body: JSON.stringify(data)
  })
  const readableResult = await putResult.json()
  if (!putResult.ok) {
    throw `Put request query error : code=${putResult.status}, error_code=${readableResult.error_code} message=${readableResult.error_message}`
  }
  return readableResult.data
}

const deleteReq = async (url, jwtToken, data) => {
  const deleteResult = await fetch(`${envData.apiURL}${url}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`,
      'Trace': generateTraceID()
    },
    body: JSON.stringify(data)
  })
  const readableResult = await deleteResult.json()
  if (!deleteResult.ok) {
    throw `Delete request query error : code=${deleteResult.status}, error_code=${readableResult.error_code} message=${readableResult.error_message}`
  }
  return readableResult.data
}

const generateTraceID = () => Math.floor(Math.random() * Math.pow(2, 63)) + 1

export { get, getQuery, post, put, deleteReq };