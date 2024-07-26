import { Connection, Keypair, Transaction, SystemProgram, PublicKey } from "@solana/web3.js";

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed")
    const account = Keypair.fromSecretKey(Uint8Array.from([26, 127, 185, 0, 144, 176, 120, 133, 214, 14, 4, 208, 227, 191, 70, 203, 174, 73, 187, 67, 16, 45, 174, 111, 32, 212, 40, 1, 124, 207, 238, 40, 220, 78, 148, 165, 224, 59, 174, 11, 60, 246, 51, 216, 212, 50, 72, 94, 175, 112, 45, 165, 116, 51, 22, 255, 167, 49, 85, 35, 68, 54, 155, 17]))
    console.log(account.publicKey.toBase58())
    console.log(account.secretKey.toString())
    console.log(await connection.getBalance(account.publicKey))

    const receiver = new PublicKey("agoqx6VC1UEBoY7JR6Kqcnz75s6TryMBXudYGcY8FP7")

    const tx = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: account.publicKey,
            toPubkey: receiver,
            lamports: 100000000,
        })
    )
    
    tx.feePayer = account.publicKey
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
    tx.partialSign(account)

    const sign = await connection.sendRawTransaction(tx.serialize());
    
    console.log(sign)


}

main()