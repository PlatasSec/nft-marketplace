import '../styles/globals.css'
import '../public/assets/css/style.css'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Layout from '../components/Layout'
import { AppContextProvider } from '../components/Context'
import { Toaster } from 'react-hot-toast'
import Script from 'next/script'
import Head from 'next/head'
import { toastStyle, toastIconTheme } from '../constants/global'

function MyApp({ Component, pageProps }) {

  return (
    <>
      <AppContextProvider>
        <Layout>
          <Head>
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Poppins:wght@400;500;700&display=swap" rel="stylesheet" />
          </Head>

          <Toaster position="top-center" reverseOrder={false}
            containerStyle={{ marginTop: 60 }}
            toastOptions={{
              style: toastStyle,
              toastIconTheme: toastIconTheme,
              success: { duration: 4000 },
              error: { duration: 6000 }
            }}
          />
          <Script src="/assets/js/script.js" strategy="lazyOnload" />
          <Component {...pageProps} />
        </Layout>
      </AppContextProvider>
    </>
  )

}

export default MyApp
