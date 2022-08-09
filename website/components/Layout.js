import React from 'react'
import Nav from './nav/Nav'
import Footer from './footer/Footer'
import SubgraphModal from './modals/SubgraphModal'
import { toastStyle, toastIconTheme } from '../constants/global'
import { Toaster } from 'react-hot-toast'
import Script from 'next/script'

function Layout({ children }) {
    return (
        <>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/cookieconsent2/3.1.0/cookieconsent.min.css" rel="stylesheet" />
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/cookieconsent2/3.1.0/cookieconsent.min.js" crossorigin="anonymous" />
            <Script src="assets/js/cookie-consent.js" />
            <Nav />
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Poppins:wght@400;500;700&display=swap" rel="stylesheet" />
            <Toaster position="top-center" reverseOrder={false}
                containerStyle={{ marginTop: 60 }}
                toastOptions={{
                    style: toastStyle,
                    toastIconTheme: toastIconTheme,
                    success: { duration: 4000 },
                    error: { duration: 6000 }
                }}
            />
            {children}
            <SubgraphModal />
            <Script src="/assets/js/script.js" strategy="lazyOnload" />
            <Footer />
        </>
    )
}

export default Layout