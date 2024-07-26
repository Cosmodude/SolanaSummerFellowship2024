import { Connection, Keypair, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL, type TransactionSignature } from "@solana/web3.js";
import { existsSync, readFileSync } from 'fs';

const filePath = 'secret_key.txt';


async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed")

    if (!existsSync(filePath)) {
        console.log('First create a wallet!')
    } else {
        const secretKeyArray = new Uint8Array(Object.values(JSON.parse(readFileSync(filePath, 'utf-8')).secretKey))
        const account = Keypair.fromSecretKey(secretKeyArray);
        const balanceBefore = await connection.getBalance(account.publicKey)
        console.log("Your Balance before Airdop: ", balanceBefore)
        const airdropSignature: TransactionSignature = await connection.requestAirdrop(
            account.publicKey,
            LAMPORTS_PER_SOL
        );
        
        await connection.confirmTransaction(airdropSignature as TransactionSignature);
        const balanceAfter = await connection.getBalance(account.publicKey)
        console.log("Your Balance after Airdop: ", balanceAfter)
    }
}

main();