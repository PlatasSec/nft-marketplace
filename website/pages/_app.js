import '../styles/globals.css'
import '../public/assets/css/style.css'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Layout from '../components/Layout'
import { AppContextProvider } from '../components/Context'

function MyApp({ Component, pageProps }) {

  return (
    <>
      <AppContextProvider>
        <Layout>          
          <Component {...pageProps} />
        </Layout>
      </AppContextProvider>
    </>
  )

}

export default MyApp
