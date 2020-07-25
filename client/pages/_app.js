import 'bootstrap/dist/css/bootstrap.css'
import buildClient from '../api/build_client'
import Header from '../components/header'

const AppComponent = ({Component, pageProps, currentUser}) => {
  return <div>
      <Header currentUser={currentUser}/>
      <Component {...pageProps} />
    </div>
}

AppComponent.getInitialProps = async (appContext) => {
  const API = buildClient(appContext.ctx)
  const { data } = await API.get('/api/users/currentuser')

  let pageProps = {};
  if(appContext.Component.getInitialProps){
    pageProps = await appContext.Component.getInitialProps(appContext.ctx)
  }

  return {
    pageProps,
    ...data
  }
}

export default AppComponent