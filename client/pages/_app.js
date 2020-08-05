import 'bootstrap/dist/css/bootstrap.css'
import buildClient from '../api/build_client'
import Header from '../components/header'

const AppComponent = ({Component, pageProps, currentUser}) => {
  return <div>
      <Header currentUser={currentUser}/>
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
}

AppComponent.getInitialProps = async (appContext) => {
  const APIClient = buildClient(appContext.ctx)
  const { data } = await APIClient.get('/api/users/currentuser')

  let pageProps = {};
  if(appContext.Component.getInitialProps){
    pageProps = await appContext.Component.getInitialProps(appContext.ctx, APIClient, data.currentUser)
  }

  return {
    pageProps,
    ...data
  }
}

export default AppComponent