import { Connection, Keypair, Transaction, SystemProgram, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createTransferInstruction, getOrCreateAssociatedTokenAccount, createAssociatedTokenAccountInstruction, createMint, getMint, mintToChecked, createAssociatedTokenAccount, createTransferCheckedInstruction, getAccount, transferChecked, burnChecked } from '@solana/spl-token';

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

function findAssociatedTokenAddress(
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey
): PublicKey {
    return PublicKey.findProgramAddressSync(
        [
            walletAddress.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            tokenMintAddress.toBuffer(),
        ],
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    )[0];
}

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed")
    const account = Keypair.fromSecretKey(Uint8Array.from([26, 127, 185, 0, 144, 176, 120, 133, 214, 14, 4, 208, 227, 191, 70, 203, 174, 73, 187, 67, 16, 45, 174, 111, 32, 212, 40, 1, 124, 207, 238, 40, 220, 78, 148, 165, 224, 59, 174, 11, 60, 246, 51, 216, 212, 50, 72, 94, 175, 112, 45, 165, 116, 51, 22, 255, 167, 49, 85, 35, 68, 54, 155, 17]))
    console.log("Account PubKey", account.publicKey.toBase58())
    //console.log(account.secretKey.toString())
    console.log("Account Sol Balance ", await connection.getBalance( account.publicKey))

    const receiver = new PublicKey("agoqx6VC1UEBoY7JR6Kqcnz75s6TryMBXudYGcY8FP7")

    let mintPubkey = await createMint(
        connection, // conneciton
        account, // fee payer
        account.publicKey, // mint authority
        account.publicKey, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
        9 // decimals
    );
    console.log("Token Mint PubKey ", mintPubkey.toBase58());

    // for data
    let mintAccount = await getMint(connection, mintPubkey);

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        account, 
        mintPubkey, 
        account.publicKey
    );

    let mintTx = await mintToChecked(
        connection, // connection
        account, // fee payer
        mintPubkey, // mint
        fromTokenAccount.address, // receiver (should be a token account)
        account, // mint authority
        2e9, // amount. if your decimals is 9, you mint 10^9 for 2 token.
        9 // decimals
    );
    console.log("Mint Tx", mintTx);
    
    let toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection, // connection
        account, // fee payer
        mintPubkey, // mint
        receiver  // owner,
    );
    
    let senderTokensBefore = await connection.getTokenAccountBalance(fromTokenAccount.address);
    console.log("Sender Token balance before", senderTokensBefore);

    let receiverTokensBefore = await connection.getTokenAccountBalance(toTokenAccount.address);
    console.log("Receiver Token balance before", receiverTokensBefore);

    let transferTx = await transferChecked(
        connection, // connection
        account, // payer
        fromTokenAccount.address, // from (should be a token account)
        mintPubkey, // mint
        toTokenAccount.address, // to (should be a token account)
        account, // from's owner
        1e9, // amount, if your deciamls is 9, send 10^9 for 1 token
        9 // decimals
    );
    
    console.log("Transfer Tx Hash", transferTx);

    let senderTokensAfter = await connection.getTokenAccountBalance(fromTokenAccount.address);
    console.log("Sender Token balance after", senderTokensAfter);

    let receiverTokensAfter = await connection.getTokenAccountBalance(toTokenAccount.address);
    console.log("Receiver Token balance after", receiverTokensAfter);

    let burnTx = await burnChecked(
        connection, // connection
        account, // fee payer
        fromTokenAccount.address, // source
        mintPubkey, // mint
        account, // owner
        1e9, // amount, if your deciamls is 9, burn 10^9 for 1 token
        9 // decimals
    );

    let senderTokensAfterBurn = await connection.getTokenAccountBalance(fromTokenAccount.address);
    console.log("Sender Token balance after burn", senderTokensAfterBurn);
}

main()