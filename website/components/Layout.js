import React from 'react'
import Nav from './nav/Nav'
import Footer from './footer/Footer'
import SubgraphModal from './modals/SubgraphModal'

function Layout({ children }) {
    return (
        <>
            <Nav />
            {children}
            <SubgraphModal />
            <Footer />
        </>
    )
}

export default Layout