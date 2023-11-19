import { words } from './wordList.js';
import { ethers } from "ethers";
import * as fs from 'fs/promises';

const provider = new ethers.getDefaultProvider("homestead", {
    etherscan: process.env.API_KEY
});

async function genSeedPhrase() {
    let seedPhrase = [];
    for (let i = 0; i < 12; i++) {
        let number = Math.floor(Math.random() * 2048);
        seedPhrase.push(words[number]);
    }

    return seedPhrase.join(' ');
}

async function main() {
    let phrase = await genSeedPhrase();
    let isValid = ethers.utils.isValidMnemonic(phrase);

    let walletMnemonic = ethers.Wallet.fromMnemonic(phrase);
    let wallet = walletMnemonic.connect(provider);
    let balance = await wallet.getBalance();

    console.log(`Seed Phrase:\n${phrase}`);
    console.log("Address: " + wallet.address + "\nBalance: " + balance + " ETH\n\n");

    try {
        let outputFileName = balance > 0 ? 'cracked.txt' : 'output.txt';
        await fs.appendFile(outputFileName, `${phrase}\n${wallet.address}\nBalance: ${balance} ETH\n\n`);
        console.log(`Seed phrase, address, and balance written to ${outputFileName}`);
    } catch (err) {
        console.error("Error writing to file:", err);
    }

    if (isValid && balance > 0) {
        // If the seed is valid and has a non-zero balance, return
        return;
    }

    return main(); // Recursive call to continue the process
}

main();