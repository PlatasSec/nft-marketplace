import { ethereum, JSONValue, json, ipfs, log, store, BigInt, dataSource, ByteArray } from "@graphprotocol/graph-ts"
import { Deposited, Withdrawn } from "../generated/Escrow/Escrow"
import { User } from "../generated/schema"

export function handleDeposit(event: Deposited): void {

    let payee = User.load(event.params.payee.toHexString())

    if (!payee || !event.params.weiAmount.gt(new BigInt(0))) return

    payee.pendingToWithdraw = payee.pendingToWithdraw.plus(event.params.weiAmount)

    let buyer = User.load(event.transaction.from.toHexString())
    if (!buyer) {
        buyer = new User(event.transaction.from.toHexString())
        buyer.deposited = new BigInt(0)
        buyer.pendingToWithdraw = new BigInt(0)
        buyer.withdrawn = new BigInt(0)
    }

    buyer.deposited = buyer.deposited.plus(event.params.weiAmount)

    payee.save()
    buyer.save()

}

export function handleWithdrawal(event: Withdrawn): void {

    let payee = User.load(event.params.payee.toHexString())

    if (!payee || !event.params.weiAmount.gt(new BigInt(0))) return

    if (payee.pendingToWithdraw.gt(event.params.weiAmount)) {
        payee.pendingToWithdraw = payee.pendingToWithdraw.minus(event.params.weiAmount)
    } else {
        payee.pendingToWithdraw = new BigInt(0)
    }

    payee.withdrawn = payee.withdrawn.plus(event.params.weiAmount)

    payee.save()

}