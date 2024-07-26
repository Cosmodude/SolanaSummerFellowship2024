import { Connection, Keypair, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { existsSync, readFileSync } from 'fs';

const filePath = 'secret_key.txt';

// Extract arguments from process.argv
const args = process.argv.slice(2); // Get arguments after the script name
// Ensure there are enough arguments
if (args.length < 2) {
    console.error('Usage: bun send <address> <amount>');
    process.exit(1);
  }

const to = args[0]; 
const amount: number = parseFloat(args[1]); 

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed")

    if (!existsSync(filePath)) {
        console.log('First create a wallet!')
    } else {
        const secretKeyArray = new Uint8Array(Object.values(JSON.parse(readFileSync(filePath, 'utf-8')).secretKey))
        const account = Keypair.fromSecretKey(secretKeyArray);
        console.log("Your wallet address is: ", account.publicKey.toBase58())
        const balance = await connection.getBalance(account.publicKey)
        console.log("Your Balance: ", balance)
        if(balance < amount * LAMPORTS_PER_SOL) {
            console.log("Insufficient Balance for sending")
            return
        }
        console.log("Sending ", amount, " to ", to)
        const tx = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: account.publicKey,
                toPubkey: new PublicKey(to),
                lamports: LAMPORTS_PER_SOL * amount,
            })
        )
        tx.feePayer = account.publicKey
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
        tx.partialSign(account)

        const sign = await connection.sendRawTransaction(tx.serialize());
    
        console.log("Transaction was sent ", sign)
    }
}

main()