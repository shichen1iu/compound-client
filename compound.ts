import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

const compoundIDl = require("./idl/compound-idl.json");
const connection = new Connection(
  "https://devnet.helius-rpc.com/?api-key=47fcd2c1-bfb0-4224-8257-ce200078152a"
);
const wallet = Keypair.fromSecretKey(
  new Uint8Array(require("./authority.json"))
);

const collectionAPublicKey = new PublicKey(
  "2BmLWt3kos1cqcakhoyEXXET5rywA3TmCU3nPDysoSj7"
);
const collectionBPublicKey = new PublicKey(
  "CQRnfDn2iLnEf8oiA8Nr9HkNNwufSoNH7f4LhQtCmQwn"
);

const provider = new anchor.AnchorProvider(
  connection,
  new anchor.Wallet(wallet),
  {
    commitment: "processed",
  }
);

const compoundProgramID = new PublicKey(compoundIDl.address);

const compoundProgram = new anchor.Program(compoundIDl as anchor.Idl, provider);

async function initVault() {
  const initVaultTx = await compoundProgram.methods
    .initVault()
    .accounts({
      payer: wallet.publicKey,
    })
    .signers([wallet])
    .rpc();
  console.log("init vault transaction signature", initVaultTx);
}

async function initCompound() {
  const compoundCollection = Keypair.generate();
  const tx = await compoundProgram.methods
    .initCompoundPool(
      "Gilgamesh",
      "https://gray-managing-penguin-864.mypinata.cloud/ipfs/QmSkBvu5k5EbEVMTe9MPjRyDS1PPeW83VFBJ9pPPKG8hQV",
      500,
      1000,
      1500,
      new BN(100_000_000) // 每天奖励0.1CPG
    )
    .accounts({
      payer: wallet.publicKey,
      collectionA: collectionAPublicKey,
      collectionB: collectionBPublicKey,
      compoundCollection: compoundCollection.publicKey,
    })
    .signers([compoundCollection])
    .rpc();
  console.log("init vault transaction signature", tx);
}

initVault();

const CPGMintAddress = PublicKey.findProgramAddressSync(
  [Buffer.from("reward_mint")],
  compoundProgramID
)[0];

console.log(CPGMintAddress.toBase58());

initCompound();