import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { writeFileSync, existsSync, readFileSync } from 'fs';

const filePath = 'secret_key.txt';

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed")

    if (!existsSync(filePath)) {
        const account = Keypair.generate()
        console.log("Your new wallet address is: ", account.publicKey.toBase58())
        // Convert PEM to JSON
        const keys = {
         secretKey: account.secretKey,
         publicKey: account.publicKey.toBase58()
        };

        // Write the private key to a file
        writeFileSync(filePath, JSON.stringify(keys, null, 2));
        
    } else {
        const wallet = new PublicKey(JSON.parse(readFileSync(filePath, 'utf-8')).publicKey)
        console.log("Your wallet address is: ", wallet.toBase58())
        console.log("Your Balance: ", await connection.getBalance(wallet))
    }
}

main()