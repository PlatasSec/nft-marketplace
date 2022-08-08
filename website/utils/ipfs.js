import { create } from 'ipfs-http-client';

const theGraphIPFSNodeUrl = new URL('https://api.thegraph.com/ipfs');

const ipfs = create({
    protocol: theGraphIPFSNodeUrl.protocol,
    host: theGraphIPFSNodeUrl.hostname,
    port: 443,
    apiPath: theGraphIPFSNodeUrl.pathname + '/api/v0'
});

export const pinJSONToIPFS = async (url, name, description) => {

    if (!name || !description || !url) return { success: false, result: "Invalid NFT metadata." }

    //create metadata object
    const metadata = new Object({ name: name, image: url, description: description })

    try {
        const result = await ipfs.add(JSON.stringify(metadata))
        return { success: true, result: "ipfs://" + result.path }

    } catch (error) {
        return { success: false, result: "An error occured while pinning the NFT metadata to Graph IPFS Node." }
    }

}
