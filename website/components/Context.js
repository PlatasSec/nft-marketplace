import React, { useContext, createContext, useState } from 'react';

//Context
export const AppContext = createContext(null);

//Provider
export const AppContextProvider = ({ children }) => {
    const [userWallet, setUserWallet] = useState({ address: "", isApproved: false, balance: false, earnings: [] });

    //
    const values = React.useMemo(() => (
        {
            userWallet, setUserWallet,
        }),
        [
            userWallet]);


    return (
        <>
            <AppContext.Provider value={{
                userWallet, setUserWallet
            }}>
                {children}
            </AppContext.Provider>
        </>
    )

}

//
export function useAppContext() {
    const context = useContext(AppContext);

    if (!context) {
        console.error('Error deploying App Context.');
    }
    return context;
}

export default useAppContext;