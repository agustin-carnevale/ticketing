import buildClient from '../api/build_client'

const LandingPage = ({ currentUser })=>{
  return currentUser? <h1>You are signed in</h1> :  <h1>You are NOT signed in</h1>
}

//Fetch data during server side rendering (on the server)
LandingPage.getInitialProps = async (context)=> {
  const API = buildClient(context)
  const {data} = await API.get('/api/users/currentuser')
  return data
}

export default LandingPage