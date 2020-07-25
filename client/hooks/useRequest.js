import axios from 'axios'
import {useState} from 'react'

export default ({url, method, body, onSuccess}) => {
  const [errors, setErrors] = useState(null)

  const doRequest = async ()=>{
    try {
      setErrors(null)
      const response = await axios[method](url,body)
      onSuccess(response.data)
      return response.data;
    } catch (err) {
      setErrors(
          <div className="alert alert-danger">
            <h5>Ooops..</h5>
            <ul className="my-0">
              {err?.response?.data?.errors.map(e => <li key={e.message}>{e.message}</li>)}
            </ul>
          </div>
      )
    }
  }
  return [doRequest, errors]
}