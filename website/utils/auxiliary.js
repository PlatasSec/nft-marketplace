import { ethers } from "ethers";
import { loremIpsum } from "lorem-ipsum";
import toast from "react-hot-toast";
import { _network } from "../constants/global";

export function shortAddress(addr) {
    if (!addr) return ""
    return addr.substring(0, 4) + "..." + addr.substring(addr.length - 3);
}

export function shortDescription(desc) {
    if (!desc) return ""
    return desc.substring(0, 80) + "...";
}

export function toCamelCase(str) {
    if (typeof (str) != "string" || str == null || str == undefined) return "-";
    str = str.replaceAll('-', ' ').replaceAll('_', ' ');
    return str.replace(/(?:^|\s)\w/g, function (match) {
        return match.toUpperCase();
    });
}

export const generateNewIMG = async () => {

    const url = `https://picsum.photos/428/524`
    return await fetch(url)
        .then(function (res) {
            return {
                success: true,
                data: {
                    id: res.headers.get('Picsum-ID'),
                    src: res.url
                }
            }
        })

}

export function getNewParagraph() {

    return loremIpsum({
        count: 5,                // Number of "words", "sentences", or "paragraphs"
        format: "plain",         // "plain" or "html"
        paragraphLowerBound: 3,  // Min. number of sentences per paragraph.
        paragraphUpperBound: 7,  // Max. number of sentences per paragarph.
        random: Math.random,     // A PRNG function
        sentenceLowerBound: 5,   // Min. number of words per sentence.
        sentenceUpperBound: 12,  // Max. number of words per sentence.
        suffix: "\n",            // Line ending, defaults to "\n" or "\r\n" (win32)
        units: "sentences"
    })
}

export function generateNewTitle() {

    return toCamelCase(loremIpsum({
        count: 1,                // Number of "words", "sentences", or "paragraphs"
        format: "plain",         // "plain" or "html"
        paragraphLowerBound: 3,  // Min. number of sentences per paragraph.
        paragraphUpperBound: 7,  // Max. number of sentences per paragarph.
        random: Math.random,     // A PRNG function
        sentenceLowerBound: 5,   // Min. number of words per sentence.
        sentenceUpperBound: 15,  // Max. number of words per sentence.
        suffix: "\n",            // Line ending, defaults to "\n" or "\r\n" (win32)
        units: "words"
    }))
}

export function convertToFullDateTime(_date) {
    if (isNaN(_date)) return -1;

    var newDate = new Date(_date * 1000);
    const options = { month: 'short', day: 'numeric', hour: 'numeric', hour12: false, minute: 'numeric', timeZone: 'UTC', timeZoneName: 'short' };
    newDate = newDate.toLocaleDateString("en-EN", options);

    return newDate;
}

export function formatMarketplaceTableContent(data) {
    let newData = new Array()
    for (let index = 0; index < data.length; index++) {
        newData.push({
            event: data[index].type,
            price: ethers.utils.formatEther(data[index].item.price.toString()),
            from: shortAddress(data[index].from.id),
            to: shortAddress(data[index].to.id),
            tokenId: data[index].item.token.tokenID,
            date: convertToFullDateTime(data[index].createdAt),
            tx: shortAddress(data[index].hash),
        })
    }

    return newData
}

export function getTransactionExplorer(hash) {

    if (!hash) return ""

    return _network.explorer.transaction + hash

}

export function getAddressExplorer(addr) {

    if (!addr || addr == '') return ""

    return _network.explorer.address + addr

}

export function getOwnerTokenExplorer(token, owner) {

    if (!token || !owner) return ""

    return _network.explorer.token + token + "?a=" + owner

}

export function mergerAllHolderTradesIntoOneArray(from, to) {

    if (!from && !to) return []

    if (!from && to) return to

    if (from && !to) return from

    let finalTrades = [...from, ...to]

    return finalTrades.sort((a, b) => b.createdAt - a.createdAt);

}

export function showTransactionPopUp(hash) {

    if (!hash || hash == '') return

    toast(
        <div>
            Check your transaction:
            <a href={`${_network.explorer.transaction}${hash}`}
                target={"_blank"}> {shortAddress(hash)}</a>
        </div>,
        { position: 'bottom-right', icon: '🔎', duration: 7000 }
    )
}