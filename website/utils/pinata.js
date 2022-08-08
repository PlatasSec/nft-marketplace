// These functions were used in the past to pin the NFT metadata to Pinata
// Check the current IPFS functions in /utils/ipfs.js with Graph IPFS Node

export const pinJSONToIPFS = async (url, name, description) => {

    if (!name || !description || !url) return { success: false, result: "Invalid NFT metadata." }

    //make metadata
    const metadata = new Object({ name: name, image: url, description: description })

    const res = await fetch('/api/pinata', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata),
    });

    if (!res.ok) return { success: false, result: "An error occurred while pinning the NFT metadata to Pinata." }

    return { success: true, result: await res.json() }

}

export const deleteJSONFromIPFS = async (tokenURI) => {

    if (!tokenURI)  return { success: false, result: "Invalid token URI." }

    const res = await fetch('/api/pinata', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tokenURI.replace("ipfs://", "")),
    });

    if (!res.ok) return { success: false, result: "An error occurred while unpinning the NFT metadata to Pinata." }

    return { success: true, result: tokenURI }

}
