// These functions were used in the past to pin the NFT metadata to Pinata
// Check the current IPFS functions in /utils/ipfs.js with Graph IPFS Node

const key = process.env.PINATA_KEY
const secret = process.env.PINATA_SECRET

import axios from "axios"

export default async function handler(req, res) {

    if (req.method === 'POST') {

        const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`
        const JSONBody = req.body;

        if (!JSONBody) return res.status(400).send();

        try {
            const result = await axios.post(url, JSONBody, { headers: { pinata_api_key: key, pinata_secret_api_key: secret } });
            res.status(200).json("ipfs://" + result.data.IpfsHash);
        } catch (err) {
            if (err.response && err.response.status) {
                res.status(err.response.status).send({ error: err.response.data.error.details })
            } else {
                res.status(500).send();
            }
        }

    } else if (req.method === 'DELETE') {

        const tokenURI = req.body;

        if (!tokenURI) return res.status(400).send();

        const url = `https://api.pinata.cloud/pinning/unpin/${tokenURI}`

        try {
            const result = await axios.delete(url, { headers: { pinata_api_key: key, pinata_secret_api_key: secret } });
            res.status(200).send()
        } catch (err) {
            if (err.response && err.response.status) {
                res.status(err.response.status).send({ error: err.response.data.error.details })
            } else {
                res.status(500).send();
            }
        }
    }
}
