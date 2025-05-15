/**
 * Minified by jsDelivr using Terser v5.10.0.
 * Original file: /npm/@metaplex/js@4.12.0/lib/index.browser.esm.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import axios from "axios";
import {
  clusterApiUrl,
  Connection as Connection$1,
  SystemProgram,
  PublicKey,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
  Keypair,
  Transaction as Transaction$1,
} from "@solana/web3.js";
import {sha256} from "crypto-hash";
import {Buffer as Buffer$1} from "buffer";
import {
  MintLayout,
  TOKEN_PROGRAM_ID,
  Token,
  AccountLayout,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  NATIVE_MINT,
} from "@solana/spl-token";
import * as mplTokenVault from "@metaplex-foundation/mpl-token-vault";
import {
  Vault,
  SafetyDepositBox,
  AddTokenToInactiveVault,
  ActivateVault,
  CombineVault,
  ExternalPriceAccountData,
  VaultProgram,
  UpdateExternalPriceAccount,
  InitVault,
} from "@metaplex-foundation/mpl-token-vault";
import * as mplCore from "@metaplex-foundation/mpl-core";
import {Transaction, config, Account} from "@metaplex-foundation/mpl-core";
import BN from "bn.js";
import * as mplMetaplex from "@metaplex-foundation/mpl-metaplex";
import {
  Store,
  SetStore,
  StoreConfig,
  SetStoreV2,
  AuctionManager,
  MetaplexProgram,
  SafetyDepositConfig,
  RedeemFullRightsTransferBid,
  PrizeTrackingTicket,
  RedeemPrintingV2Bid,
  RedeemParticipationBidV3,
  WinningConstraint,
  NonWinningConstraint,
  ClaimBid,
  WinningConfigType,
} from "@metaplex-foundation/mpl-metaplex";
import * as mplTokenMetadata from "@metaplex-foundation/mpl-token-metadata";
import {
  Metadata,
  MasterEdition,
  Creator,
  MetadataDataData,
  CreateMetadata,
  CreateMasterEdition,
  EditionMarker,
  Edition,
  MintNewEditionFromMasterEditionViaToken,
  SignMetadata,
  UpdateMetadata,
  UpdatePrimarySaleHappenedViaToken,
} from "@metaplex-foundation/mpl-token-metadata";
import * as mplAuction from "@metaplex-foundation/mpl-auction";
import {
  AuctionExtended,
  BidderPot,
  BidderMetadata,
  CancelBid,
  PlaceBid,
  Auction,
  CreateAuctionArgs,
  CreateAuction,
} from "@metaplex-foundation/mpl-auction";
var Currency;
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function __awaiter(e, t, n, a) {
  return new (n || (n = Promise))(function (i, o) {
    function r(e) {
      try {
        d(a.next(e));
      } catch (e) {
        o(e);
      }
    }
    function c(e) {
      try {
        d(a.throw(e));
      } catch (e) {
        o(e);
      }
    }
    function d(e) {
      var t;
      e.done
        ? i(e.value)
        : ((t = e.value),
          t instanceof n
            ? t
            : new n(function (e) {
                e(t);
              })).then(r, c);
    }
    d((a = a.apply(e, t || [])).next());
  });
}
!(function (e) {
  (e.USD = "usd"), (e.EUR = "eur"), (e.AR = "ar"), (e.SOL = "sol");
})(Currency || (Currency = {}));
class Coingecko {
  static translateCurrency(e) {
    switch (e) {
      case Currency.AR:
        return "arweave";
      case Currency.SOL:
        return "solana";
      case Currency.USD:
        return "usd";
      case Currency.EUR:
        return "eur";
      default:
        throw new Error(
          "Invalid currency supplied to Coingecko conversion rate provider"
        );
    }
  }
  getRate(e, t) {
    return __awaiter(this, void 0, void 0, function* () {
      const n = "string" == typeof e ? [e] : e,
        a = "string" == typeof t ? [t] : t,
        i = `https://api.coingecko.com/api/v3/simple/price?ids=${n
          .map((e) => Coingecko.translateCurrency(e))
          .join(",")}&vs_currencies=${a
          .map((e) => Coingecko.translateCurrency(e))
          .join(",")}`,
        o = yield axios(i),
        r = yield o.data;
      return n.reduce(
        (e, t) => [
          ...e,
          ...a.map((e) => ({
            from: t,
            to: e,
            rate: r[Coingecko.translateCurrency(t)][
              Coingecko.translateCurrency(e)
            ],
          })),
        ],
        []
      );
    });
  }
}
var browser = "object" == typeof self ? self.FormData : window.FormData;
const ARWEAVE_URL = "https://arweave.net",
  LAMPORT_MULTIPLIER = Math.pow(10, 9),
  WINSTON_MULTIPLIER = Math.pow(10, 12);
class ArweaveStorage {
  constructor({endpoint: e, env: t}) {
    (this.endpoint = e), (this.env = t);
  }
  getAssetCostToStore(e, t, n) {
    return __awaiter(this, void 0, void 0, function* () {
      const a = Array.from(e.values()),
        i = a.reduce((e, t) => e + t.byteLength, 0),
        o = parseInt(yield (yield axios(`${ARWEAVE_URL}/price/0`)).data),
        r = parseInt(
          yield (yield axios(`${ARWEAVE_URL}/price/${i.toString()}`)).data
        ),
        c = (o * a.length + r) / WINSTON_MULTIPLIER;
      return LAMPORT_MULTIPLIER * c * (t / n) * 1.1;
    });
  }
  upload(e, t, n) {
    return __awaiter(this, void 0, void 0, function* () {
      const a = Array.from(e.entries()),
        i = a.reduce((e, [n]) => ((e[n] = [{name: "mint", value: t}]), e), {}),
        o = new browser();
      o.append("tags", JSON.stringify(i)),
        o.append("transaction", n),
        o.append("env", this.env),
        a.map(([, e]) => {
          o.append("file[]", e);
        });
      const r = yield axios.post(this.endpoint, o);
      return r.data.error ? Promise.reject(new Error(r.data.error)) : r.data;
    });
  }
}
class Storage {}
var ChainId,
  Storage$1 = Object.freeze({__proto__: null, Storage: Storage});
!(function (e) {
  (e[(e.MainnetBeta = 101)] = "MainnetBeta"),
    (e[(e.Testnet = 102)] = "Testnet"),
    (e[(e.Devnet = 103)] = "Devnet");
})(ChainId || (ChainId = {}));
const ENV = {
  devnet: {endpoint: clusterApiUrl("devnet"), ChainId: ChainId.Devnet},
  "mainnet-beta": {
    endpoint: "https://api.metaplex.solana.com/",
    ChainId: ChainId.MainnetBeta,
  },
  "mainnet-beta (Solana)": {
    endpoint: "https://api.mainnet-beta.solana.com",
    ChainId: ChainId.MainnetBeta,
  },
  "mainnet-beta (Serum)": {
    endpoint: "https://solana-api.projectserum.com/",
    ChainId: ChainId.MainnetBeta,
  },
  testnet: {endpoint: clusterApiUrl("testnet"), ChainId: ChainId.Testnet},
};
class Connection extends Connection$1 {
  constructor(e = "mainnet-beta", t) {
    e in ENV && (e = ENV[e].endpoint), super(e, t);
  }
}
class NodeWallet {
  constructor(e) {
    this.payer = e;
  }
  signTransaction(e) {
    return __awaiter(this, void 0, void 0, function* () {
      return e.partialSign(this.payer), e;
    });
  }
  signAllTransactions(e) {
    return __awaiter(this, void 0, void 0, function* () {
      return e.map((e) => (e.partialSign(this.payer), e));
    });
  }
  get publicKey() {
    return this.payer.publicKey;
  }
}
const getFileHash = (e) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return Buffer$1.from(yield sha256(e.toString()));
  });
var crypto = Object.freeze({__proto__: null, getFileHash: getFileHash});
const lookup = (e) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const {data: t} = yield axios.get(e);
      return t;
    } catch (t) {
      throw new Error(`unable to get metadata json from url ${e}`);
    }
  });
var metadata = Object.freeze({__proto__: null, lookup: lookup}),
  index$3 = Object.freeze({
    __proto__: null,
    Crypto: crypto,
    metadata: metadata,
  });
class PayForFiles extends Transaction {
  constructor(e, t) {
    const {feePayer: n} = e,
      {lamports: a, fileHashes: i, arweaveWallet: o} = t;
    super(e),
      this.add(
        SystemProgram.transfer({
          fromPubkey: n,
          toPubkey: null != o ? o : new PublicKey(config.arweaveWallet),
          lamports: a,
        })
      ),
      i.forEach((e) => {
        this.add(
          new TransactionInstruction({
            keys: [],
            programId: new PublicKey(config.programs.memo),
            data: e,
          })
        );
      });
  }
}
class CreateMint extends Transaction {
  constructor(e, t) {
    const {feePayer: n} = e,
      {
        newAccountPubkey: a,
        lamports: i,
        decimals: o,
        owner: r,
        freezeAuthority: c,
      } = t;
    super(e),
      this.add(
        SystemProgram.createAccount({
          fromPubkey: n,
          newAccountPubkey: a,
          lamports: i,
          space: MintLayout.span,
          programId: TOKEN_PROGRAM_ID,
        })
      ),
      this.add(
        Token.createInitMintInstruction(
          TOKEN_PROGRAM_ID,
          a,
          null != o ? o : 0,
          null != r ? r : n,
          null != c ? c : n
        )
      );
  }
}
class CreateTokenAccount extends Transaction {
  constructor(e, t) {
    const {feePayer: n} = e,
      {newAccountPubkey: a, lamports: i, mint: o, owner: r} = t;
    super(e),
      this.add(
        SystemProgram.createAccount({
          fromPubkey: n,
          newAccountPubkey: a,
          lamports: i,
          space: AccountLayout.span,
          programId: TOKEN_PROGRAM_ID,
        })
      ),
      this.add(
        Token.createInitAccountInstruction(
          TOKEN_PROGRAM_ID,
          o,
          a,
          null != r ? r : n
        )
      );
  }
}
class CreateAssociatedTokenAccount extends Transaction {
  constructor(e, t) {
    const {feePayer: n} = e,
      {associatedTokenAddress: a, walletAddress: i, splTokenMintAddress: o} = t;
    super(e),
      this.add(
        new TransactionInstruction({
          keys: [
            {pubkey: n, isSigner: !0, isWritable: !0},
            {pubkey: a, isSigner: !1, isWritable: !0},
            {pubkey: null != i ? i : n, isSigner: !1, isWritable: !1},
            {pubkey: o, isSigner: !1, isWritable: !1},
            {pubkey: SystemProgram.programId, isSigner: !1, isWritable: !1},
            {pubkey: TOKEN_PROGRAM_ID, isSigner: !1, isWritable: !1},
            {pubkey: SYSVAR_RENT_PUBKEY, isSigner: !1, isWritable: !1},
          ],
          programId: ASSOCIATED_TOKEN_PROGRAM_ID,
          data: Buffer$1.from([]),
        })
      );
  }
}
class MintTo extends Transaction {
  constructor(e, t) {
    const {feePayer: n} = e,
      {mint: a, dest: i, authority: o, amount: r} = t;
    super(e),
      this.add(
        Token.createMintToInstruction(
          TOKEN_PROGRAM_ID,
          a,
          i,
          null != o ? o : n,
          [],
          new BN(r).toNumber()
        )
      );
  }
}
var index$2 = Object.freeze({
  __proto__: null,
  PayForFiles: PayForFiles,
  CreateMint: CreateMint,
  CreateTokenAccount: CreateTokenAccount,
  CreateAssociatedTokenAccount: CreateAssociatedTokenAccount,
  MintTo: MintTo,
});
function prepareTokenAccountAndMintTxs(e, t) {
  return __awaiter(this, void 0, void 0, function* () {
    const n = Keypair.generate(),
      a = yield e.getMinimumBalanceForRentExemption(MintLayout.span),
      i = new CreateMint(
        {feePayer: t},
        {newAccountPubkey: n.publicKey, lamports: a}
      ),
      o = yield Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        n.publicKey,
        t
      );
    return {
      mint: n,
      createMintTx: i,
      createAssociatedTokenAccountTx: new CreateAssociatedTokenAccount(
        {feePayer: t},
        {associatedTokenAddress: o, splTokenMintAddress: n.publicKey}
      ),
      mintToTx: new MintTo(
        {feePayer: t},
        {mint: n.publicKey, dest: o, amount: 1}
      ),
      recipient: o,
    };
  });
}
function createWrappedAccountTxs(e, t, n = 0) {
  return __awaiter(this, void 0, void 0, function* () {
    const a = Keypair.generate(),
      i = yield e.getMinimumBalanceForRentExemption(AccountLayout.span);
    return {
      account: a,
      createTokenAccountTx: new CreateTokenAccount(
        {feePayer: t},
        {newAccountPubkey: a.publicKey, lamports: n + i, mint: NATIVE_MINT}
      ),
      closeTokenAccountTx: new Transaction().add(
        Token.createCloseAccountInstruction(
          TOKEN_PROGRAM_ID,
          a.publicKey,
          t,
          t,
          []
        )
      ),
    };
  });
}
function createApproveTxs(e) {
  const {
    authority: t = Keypair.generate(),
    account: n,
    owner: a,
    amount: i,
  } = e;
  return {
    authority: t,
    createApproveTx: new Transaction$1().add(
      Token.createApproveInstruction(TOKEN_PROGRAM_ID, n, t.publicKey, a, [], i)
    ),
    createRevokeTx: new Transaction$1().add(
      Token.createRevokeInstruction(TOKEN_PROGRAM_ID, n, a, [])
    ),
  };
}
const sendTransaction = ({
  connection: e,
  wallet: t,
  txs: n,
  signers: a = [],
  options: i,
}) =>
  __awaiter(void 0, void 0, void 0, function* () {
    let o = Transaction.fromCombined(n, {feePayer: t.publicKey});
    return (
      (o.recentBlockhash = (yield e.getRecentBlockhash()).blockhash),
      a.length && o.partialSign(...a),
      (o = yield t.signTransaction(o)),
      e.sendRawTransaction(o.serialize(), i)
    );
  });
class TransactionsBatch {
  constructor({
    beforeTransactions: e = [],
    transactions: t,
    afterTransactions: n = [],
  }) {
    (this.signers = []),
      (this.beforeTransactions = e),
      (this.transactions = t),
      (this.afterTransactions = n);
  }
  addSigner(e) {
    this.signers.push(e);
  }
  addBeforeTransaction(e) {
    this.beforeTransactions.push(e);
  }
  addTransaction(e) {
    this.transactions.push(e);
  }
  addAfterTransaction(e) {
    this.afterTransactions.push(e);
  }
  toTransactions() {
    return [
      ...this.beforeTransactions,
      ...this.transactions,
      ...this.afterTransactions,
    ];
  }
  toInstructions() {
    return this.toTransactions().flatMap((e) => e.instructions);
  }
}
const addTokensToVault = ({connection: e, wallet: t, vault: n, nfts: a}) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const i = {feePayer: t.publicKey},
        o = [],
        r = yield Vault.getPDA(n),
        c = yield e.getMinimumBalanceForRentExemption(AccountLayout.span);
      for (const d of a) {
        const a = new TransactionsBatch({transactions: []}),
          s = yield SafetyDepositBox.getPDA(n, d.tokenMint),
          u = Keypair.generate(),
          l = new CreateTokenAccount(i, {
            newAccountPubkey: u.publicKey,
            lamports: c,
            mint: d.tokenMint,
            owner: r,
          });
        a.addTransaction(l), a.addSigner(u);
        const {authority: y, createApproveTx: p} = createApproveTxs({
          account: d.tokenAccount,
          owner: t.publicKey,
          amount: d.amount.toNumber(),
        });
        a.addTransaction(p), a.addSigner(y);
        const T = new AddTokenToInactiveVault(i, {
          vault: n,
          vaultAuthority: t.publicKey,
          tokenAccount: d.tokenAccount,
          tokenStoreAccount: u.publicKey,
          transferAuthority: y.publicKey,
          safetyDepositBox: s,
          amount: d.amount,
        });
        a.addTransaction(T);
        const A = yield sendTransaction({
          connection: e,
          wallet: t,
          txs: a.transactions,
          signers: a.signers,
        });
        o.push({
          txId: A,
          tokenStoreAccount: u.publicKey,
          tokenMint: d.tokenMint,
          tokenAccount: d.tokenAccount,
        });
      }
      return {safetyDepositTokenStores: o};
    }),
  initStore = ({connection: e, wallet: t, isPublic: n = !0}) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const a = yield Store.getPDA(t.publicKey),
        i = new SetStore(
          {feePayer: t.publicKey},
          {admin: new PublicKey(t.publicKey), store: a, isPublic: n}
        );
      return {
        storeId: a,
        txId: yield sendTransaction({connection: e, wallet: t, txs: [i]}),
      };
    }),
  initStoreV2 = ({
    connection: e,
    wallet: t,
    settingsUri: n = null,
    isPublic: a = !0,
  }) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const i = yield Store.getPDA(t.publicKey),
        o = yield StoreConfig.getPDA(i),
        r = new SetStoreV2(
          {feePayer: t.publicKey},
          {
            admin: new PublicKey(t.publicKey),
            store: i,
            config: o,
            isPublic: a,
            settingsUri: n,
          }
        );
      return {
        storeId: i,
        configId: o,
        txId: yield sendTransaction({connection: e, wallet: t, txs: [r]}),
      };
    }),
  mintNFT = ({connection: e, wallet: t, uri: n, maxSupply: a}) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const {
          mint: i,
          createMintTx: o,
          createAssociatedTokenAccountTx: r,
          mintToTx: c,
        } = yield prepareTokenAccountAndMintTxs(e, t.publicKey),
        d = yield Metadata.getPDA(i.publicKey),
        s = yield MasterEdition.getPDA(i.publicKey),
        {
          name: u,
          symbol: l,
          seller_fee_basis_points: y,
          properties: {creators: p},
        } = yield lookup(n),
        T = p.reduce((e, {address: n, share: a}) => {
          const i = n === t.publicKey.toString(),
            o = new Creator({address: n, share: a, verified: i});
          return (e = [...e, o]);
        }, []),
        A = new MetadataDataData({
          name: u,
          symbol: l,
          uri: n,
          sellerFeeBasisPoints: y,
          creators: T,
        }),
        m = new CreateMetadata(
          {feePayer: t.publicKey},
          {
            metadata: d,
            metadataData: A,
            updateAuthority: t.publicKey,
            mint: i.publicKey,
            mintAuthority: t.publicKey,
          }
        ),
        g = new CreateMasterEdition(
          {feePayer: t.publicKey},
          {
            edition: s,
            metadata: d,
            updateAuthority: t.publicKey,
            mint: i.publicKey,
            mintAuthority: t.publicKey,
            maxSupply: a || 0 === a ? new BN(a) : null,
          }
        );
      return {
        txId: yield sendTransaction({
          connection: e,
          signers: [i],
          txs: [o, m, r, c, g],
          wallet: t,
        }),
        mint: i.publicKey,
        metadata: d,
        edition: s,
      };
    }),
  mintEditionFromMaster = ({
    connection: e,
    wallet: t,
    masterEditionMint: n,
    updateAuthority: a,
  } = {}) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const i = yield MasterEdition.getPDA(n),
        o = yield Metadata.getPDA(n),
        r = yield Account.getInfo(e, i),
        c = new MasterEdition(i, r).data.supply.add(new BN(1)),
        {
          mint: d,
          createMintTx: s,
          createAssociatedTokenAccountTx: u,
          mintToTx: l,
        } = yield prepareTokenAccountAndMintTxs(e, t.publicKey),
        y = yield Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          n,
          t.publicKey
        ),
        p = yield Metadata.getPDA(d.publicKey),
        T = yield EditionMarker.getPDA(n, c),
        A = yield Edition.getPDA(d.publicKey),
        m = new MintNewEditionFromMasterEditionViaToken(
          {feePayer: t.publicKey},
          {
            edition: A,
            metadata: p,
            updateAuthority: null != a ? a : t.publicKey,
            mint: d.publicKey,
            mintAuthority: t.publicKey,
            masterEdition: i,
            masterMetadata: o,
            editionMarker: T,
            tokenOwner: t.publicKey,
            tokenAccount: y,
            editionValue: c,
          }
        );
      return {
        txId: yield sendTransaction({
          connection: e,
          signers: [d],
          txs: [s, u, l, m],
          wallet: t,
        }),
        mint: d.publicKey,
        metadata: p,
        edition: A,
      };
    }),
  createMetadata = ({
    connection: e,
    wallet: t,
    editionMint: n,
    metadataData: a,
    updateAuthority: i,
  } = {}) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const o = yield Metadata.getPDA(n),
        r = new CreateMetadata(
          {feePayer: t.publicKey},
          {
            metadata: o,
            metadataData: a,
            updateAuthority: null != i ? i : t.publicKey,
            mint: n,
            mintAuthority: t.publicKey,
          }
        );
      return sendTransaction({connection: e, signers: [], txs: [r], wallet: t});
    }),
  createMasterEdition = ({
    connection: e,
    wallet: t,
    editionMint: n,
    updateAuthority: a,
    maxSupply: i,
  } = {}) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const o = yield Metadata.getPDA(n),
        r = yield MasterEdition.getPDA(n),
        c = new CreateMasterEdition(
          {feePayer: t.publicKey},
          {
            edition: r,
            metadata: o,
            updateAuthority: null != a ? a : t.publicKey,
            mint: n,
            mintAuthority: t.publicKey,
            maxSupply: i,
          }
        );
      return sendTransaction({connection: e, signers: [], txs: [c], wallet: t});
    }),
  signMetadata = ({connection: e, wallet: t, editionMint: n, signer: a} = {}) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const i = yield Metadata.getPDA(n),
        o = new SignMetadata(
          {feePayer: t.publicKey},
          {metadata: i, creator: a ? a.publicKey : t.publicKey}
        );
      return yield sendTransaction({
        connection: e,
        signers: a ? [a] : [],
        txs: [o],
        wallet: t,
      });
    }),
  updateMetadata = ({
    connection: e,
    wallet: t,
    editionMint: n,
    newMetadataData: a,
    newUpdateAuthority: i,
    primarySaleHappened: o,
  } = {}) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const r = yield Metadata.getPDA(n),
        c = new UpdateMetadata(
          {feePayer: t.publicKey},
          {
            metadata: r,
            updateAuthority: t.publicKey,
            metadataData: a,
            newUpdateAuthority: i,
            primarySaleHappened: o,
          }
        );
      return sendTransaction({connection: e, signers: [], txs: [c], wallet: t});
    }),
  cancelBid = ({
    connection: e,
    wallet: t,
    auction: n,
    bidderPotToken: a,
    destAccount: i,
  }) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const o = t.publicKey,
        r = yield AuctionManager.getPDA(n),
        c = yield AuctionManager.load(e, r),
        {
          data: {tokenMint: d},
        } = yield c.getAuction(e),
        s = new PublicKey(d),
        u = new PublicKey(c.data.vault),
        l = yield AuctionExtended.getPDA(u),
        y = yield BidderPot.getPDA(n, o),
        p = yield BidderMetadata.getPDA(n, o),
        T = yield e.getMinimumBalanceForRentExemption(AccountLayout.span),
        A = yield getCancelBidTransactions({
          destAccount: i,
          bidder: o,
          accountRentExempt: T,
          bidderPot: y,
          bidderPotToken: a,
          bidderMeta: p,
          auction: n,
          auctionExtended: l,
          auctionTokenMint: s,
          vault: u,
        });
      return {
        txId: yield sendTransaction({
          connection: e,
          wallet: t,
          txs: A.toTransactions(),
          signers: A.signers,
        }),
      };
    }),
  getCancelBidTransactions = ({
    destAccount: e,
    bidder: t,
    accountRentExempt: n,
    bidderPot: a,
    bidderPotToken: i,
    bidderMeta: o,
    auction: r,
    auctionExtended: c,
    auctionTokenMint: d,
    vault: s,
  }) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const u = new TransactionsBatch({transactions: []});
      if (!e) {
        const a = Keypair.generate(),
          i = new CreateTokenAccount(
            {feePayer: t},
            {newAccountPubkey: a.publicKey, lamports: n, mint: NATIVE_MINT}
          ),
          o = new Transaction().add(
            Token.createCloseAccountInstruction(
              TOKEN_PROGRAM_ID,
              a.publicKey,
              t,
              t,
              []
            )
          );
        u.addTransaction(i),
          u.addAfterTransaction(o),
          u.addSigner(a),
          (e = a.publicKey);
      }
      const l = new CancelBid(
        {feePayer: t},
        {
          bidder: t,
          bidderToken: e,
          bidderPot: a,
          bidderPotToken: i,
          bidderMeta: o,
          auction: r,
          auctionExtended: c,
          tokenMint: d,
          resource: s,
        }
      );
      return u.addTransaction(l), u;
    }),
  placeBid = ({
    connection: e,
    wallet: t,
    amount: n,
    auction: a,
    bidderPotToken: i,
  }) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const o = t.publicKey,
        r = yield e.getMinimumBalanceForRentExemption(AccountLayout.span),
        c = yield AuctionManager.getPDA(a),
        d = yield AuctionManager.load(e, c),
        {
          data: {tokenMint: s},
        } = yield d.getAuction(e),
        u = new PublicKey(s),
        l = new PublicKey(d.data.vault),
        y = yield AuctionExtended.getPDA(l),
        p = yield BidderPot.getPDA(a, o),
        T = yield BidderMetadata.getPDA(a, o);
      let A = new TransactionsBatch({transactions: []});
      if (i)
        A = yield getCancelBidTransactions({
          destAccount: null,
          bidder: o,
          accountRentExempt: r,
          bidderPot: p,
          bidderPotToken: i,
          bidderMeta: T,
          auction: a,
          auctionExtended: y,
          auctionTokenMint: u,
          vault: l,
        });
      else {
        const e = Keypair.generate(),
          t = new CreateTokenAccount(
            {feePayer: o},
            {newAccountPubkey: e.publicKey, lamports: r, mint: u, owner: a}
          );
        A.addSigner(e), A.addTransaction(t), (i = e.publicKey);
      }
      const {
        account: m,
        createTokenAccountTx: g,
        closeTokenAccountTx: b,
      } = yield createWrappedAccountTxs(e, o, n.toNumber() + 2 * r);
      A.addTransaction(g), A.addAfterTransaction(b), A.addSigner(m);
      const {
        authority: f,
        createApproveTx: P,
        createRevokeTx: w,
      } = createApproveTxs({
        account: m.publicKey,
        owner: o,
        amount: n.toNumber(),
      });
      A.addTransaction(P), A.addAfterTransaction(w), A.addSigner(f);
      const M = new PlaceBid(
        {feePayer: o},
        {
          bidder: o,
          bidderToken: m.publicKey,
          bidderPot: p,
          bidderPotToken: i,
          bidderMeta: T,
          auction: a,
          auctionExtended: y,
          tokenMint: u,
          transferAuthority: f.publicKey,
          amount: n,
          resource: l,
        }
      );
      A.addTransaction(M);
      return {
        txId: yield sendTransaction({
          connection: e,
          wallet: t,
          txs: A.toTransactions(),
          signers: A.signers,
        }),
        bidderPotToken: i,
        bidderMeta: T,
      };
    }),
  redeemFullRightsTransferBid = ({
    connection: e,
    wallet: t,
    store: n,
    auction: a,
  }) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const i = t.publicKey,
        o = yield e.getMinimumBalanceForRentExemption(AccountLayout.span),
        r = yield AuctionManager.getPDA(a),
        c = yield AuctionManager.load(e, r),
        d = yield Vault.load(e, c.data.vault),
        s = new PublicKey(d.data.fractionMint),
        u = yield AuctionExtended.getPDA(d.pubkey),
        [l] = yield d.getSafetyDepositBoxes(e),
        y = new PublicKey(l.data.tokenMint),
        p = new PublicKey(l.data.store),
        T = yield BidderMetadata.getPDA(a, i),
        A = yield getBidRedemptionPDA(a, T),
        m = yield SafetyDepositConfig.getPDA(r, l.pubkey),
        g = yield Vault.getPDA(d.pubkey),
        b = yield Metadata.getPDA(y),
        f = yield getRedeemFRTBidTransactions({
          accountRentExempt: o,
          tokenMint: y,
          bidder: i,
          bidderMeta: T,
          store: n,
          vault: d.pubkey,
          auction: a,
          auctionExtended: u,
          auctionManager: r,
          fractionMint: s,
          safetyDepositTokenStore: p,
          safetyDeposit: l.pubkey,
          bidRedemption: A,
          safetyDepositConfig: m,
          transferAuthority: g,
          metadata: b,
        });
      return {
        txId: yield sendTransaction({
          connection: e,
          wallet: t,
          txs: f.toTransactions(),
          signers: f.signers,
        }),
      };
    }),
  getRedeemFRTBidTransactions = ({
    accountRentExempt: e,
    bidder: t,
    tokenMint: n,
    store: a,
    vault: i,
    auction: o,
    auctionManager: r,
    auctionExtended: c,
    bidRedemption: d,
    bidderMeta: s,
    safetyDepositTokenStore: u,
    safetyDeposit: l,
    fractionMint: y,
    safetyDepositConfig: p,
    transferAuthority: T,
    metadata: A,
  }) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const m = new TransactionsBatch({transactions: []}),
        g = Keypair.generate(),
        b = new CreateTokenAccount(
          {feePayer: t},
          {newAccountPubkey: g.publicKey, lamports: e, mint: n}
        );
      m.addSigner(g), m.addTransaction(b);
      const f = new RedeemFullRightsTransferBid(
        {feePayer: t},
        {
          store: a,
          vault: i,
          auction: o,
          auctionManager: r,
          bidRedemption: d,
          bidMetadata: s,
          safetyDepositTokenStore: u,
          destination: g.publicKey,
          safetyDeposit: l,
          fractionMint: y,
          bidder: t,
          safetyDepositConfig: p,
          auctionExtended: c,
          transferAuthority: T,
          newAuthority: t,
          masterMetadata: A,
        }
      );
      m.addTransaction(f);
      const P = new UpdatePrimarySaleHappenedViaToken(
        {feePayer: t},
        {metadata: A, owner: t, tokenAccount: g.publicKey}
      );
      return m.addTransaction(P), m;
    }),
  getBidRedemptionPDA = (e, t) =>
    __awaiter(void 0, void 0, void 0, function* () {
      return (yield PublicKey.findProgramAddress(
        [Buffer.from(MetaplexProgram.PREFIX), e.toBuffer(), t.toBuffer()],
        MetaplexProgram.PUBKEY
      ))[0];
    }),
  redeemPrintingV2Bid = ({connection: e, wallet: t, store: n, auction: a}) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const i = t.publicKey,
        {
          data: {bidState: o},
        } = yield Auction.load(e, a),
        r = yield AuctionManager.getPDA(a),
        c = yield AuctionManager.load(e, r),
        d = yield Vault.load(e, c.data.vault),
        s = yield AuctionExtended.getPDA(d.pubkey),
        [u] = yield d.getSafetyDepositBoxes(e),
        l = new PublicKey(u.data.tokenMint),
        y = new PublicKey(u.data.store),
        p = yield BidderMetadata.getPDA(a, i),
        T = yield getBidRedemptionPDA(a, p),
        A = yield SafetyDepositConfig.getPDA(r, u.pubkey),
        {
          mint: m,
          createMintTx: g,
          createAssociatedTokenAccountTx: b,
          mintToTx: f,
          recipient: P,
        } = yield prepareTokenAccountAndMintTxs(e, t.publicKey),
        w = m.publicKey,
        M = yield Metadata.getPDA(w),
        k = yield Edition.getPDA(w),
        x = yield Metadata.getPDA(l),
        K = yield MasterEdition.getPDA(l),
        v = yield MasterEdition.load(e, K),
        _ = yield PrizeTrackingTicket.getPDA(r, l);
      let E;
      try {
        E = yield PrizeTrackingTicket.load(e, _);
      } catch (e) {
        E = null;
      }
      const h = o.getWinnerIndex(i.toBase58()) || 0,
        D = getEditionOffset(h),
        S = ((null == E ? void 0 : E.data.supplySnapshot) || v.data.supply).add(
          D
        ),
        B = yield EditionMarker.getPDA(l, S);
      try {
        const t = yield EditionMarker.load(e, B);
        if (t.data.editionTaken(S.toNumber()))
          throw new Error("The edition is already taken");
      } catch (e) {}
      const I = yield getRedeemPrintingV2BidTransactions({
        bidder: i,
        bidderMeta: p,
        store: n,
        vault: d.pubkey,
        destination: P,
        auction: a,
        auctionExtended: s,
        auctionManager: r,
        safetyDepositTokenStore: y,
        safetyDeposit: u.pubkey,
        bidRedemption: T,
        safetyDepositConfig: A,
        metadata: x,
        newMint: w,
        newMetadata: M,
        newEdition: k,
        masterEdition: K,
        editionMarker: B,
        prizeTrackingTicket: _,
        editionOffset: D,
        winIndex: new BN(h),
      });
      I.addSigner(m),
        I.addBeforeTransaction(g),
        I.addBeforeTransaction(b),
        I.addBeforeTransaction(f);
      return {
        txId: yield sendTransaction({
          connection: e,
          wallet: t,
          txs: I.toTransactions(),
          signers: I.signers,
        }),
      };
    }),
  getRedeemPrintingV2BidTransactions = ({
    bidder: e,
    destination: t,
    store: n,
    vault: a,
    auction: i,
    auctionManager: o,
    auctionExtended: r,
    bidRedemption: c,
    bidderMeta: d,
    safetyDepositTokenStore: s,
    safetyDeposit: u,
    safetyDepositConfig: l,
    metadata: y,
    newMint: p,
    newMetadata: T,
    newEdition: A,
    masterEdition: m,
    editionMarker: g,
    prizeTrackingTicket: b,
    winIndex: f,
    editionOffset: P,
  }) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const w = new TransactionsBatch({transactions: []}),
        M = new RedeemPrintingV2Bid(
          {feePayer: e},
          {
            store: n,
            vault: a,
            auction: i,
            auctionManager: o,
            bidRedemption: c,
            bidMetadata: d,
            safetyDepositTokenStore: s,
            destination: t,
            safetyDeposit: u,
            bidder: e,
            safetyDepositConfig: l,
            auctionExtended: r,
            newMint: p,
            newEdition: A,
            newMetadata: T,
            metadata: y,
            masterEdition: m,
            editionMark: g,
            prizeTrackingTicket: b,
            winIndex: f,
            editionOffset: P,
          }
        );
      w.addTransaction(M);
      const k = new UpdatePrimarySaleHappenedViaToken(
        {feePayer: e},
        {metadata: T, owner: e, tokenAccount: t}
      );
      return w.addTransaction(k), w;
    });
function getEditionOffset(e) {
  return new BN(1).add(new BN(e));
}
const redeemParticipationBidV3 = ({
  connection: e,
  wallet: t,
  store: n,
  auction: a,
}) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const i = new TransactionsBatch({transactions: []}),
      o = new TransactionsBatch({transactions: []}),
      r = t.publicKey,
      {
        data: {bidState: c, tokenMint: d},
      } = yield Auction.load(e, a),
      s = yield AuctionManager.getPDA(a),
      u = yield AuctionManager.load(e, s),
      l = yield Vault.load(e, u.data.vault),
      y = yield AuctionExtended.getPDA(l.pubkey),
      [p] = yield l.getSafetyDepositBoxes(e),
      T = new PublicKey(p.data.tokenMint),
      A = new PublicKey(p.data.store),
      m = yield BidderMetadata.getPDA(a, r),
      g = yield getBidRedemptionPDA(a, m),
      b = yield SafetyDepositConfig.getPDA(s, p.pubkey),
      {
        data: {
          participationConfig: {fixedPrice: f},
        },
      } = yield SafetyDepositConfig.load(e, b),
      P = new PublicKey(u.data.acceptPayment),
      {
        mint: w,
        createMintTx: M,
        createAssociatedTokenAccountTx: k,
        mintToTx: x,
        recipient: K,
      } = yield prepareTokenAccountAndMintTxs(e, t.publicKey);
    i.addSigner(w),
      i.addTransaction(M),
      i.addTransaction(k),
      i.addTransaction(x);
    const v = w.publicKey,
      _ = yield Metadata.getPDA(v),
      E = yield Edition.getPDA(v),
      h = yield Metadata.getPDA(T),
      D = yield MasterEdition.getPDA(T),
      S = yield MasterEdition.load(e, D),
      B = yield PrizeTrackingTicket.getPDA(s, T),
      I = c.getWinnerIndex(r.toBase58()),
      C = S.data.supply.add(new BN(1)),
      R = yield EditionMarker.getPDA(T, C);
    let V;
    if (d === NATIVE_MINT.toBase58()) {
      const {
        account: t,
        createTokenAccountTx: n,
        closeTokenAccountTx: a,
      } = yield createWrappedAccountTxs(e, r, f.toNumber());
      (V = t.publicKey),
        i.addTransaction(n),
        i.addSigner(t),
        o.addAfterTransaction(a);
    } else V = yield Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, new PublicKey(d), r);
    const {
      authority: N,
      createApproveTx: O,
      createRevokeTx: F,
    } = createApproveTxs({account: V, owner: r, amount: f.toNumber()});
    o.addTransaction(O), o.addAfterTransaction(F), o.addSigner(N);
    const L = new RedeemParticipationBidV3(
      {feePayer: r},
      {
        store: n,
        vault: l.pubkey,
        auction: a,
        auctionManager: s,
        bidRedemption: g,
        bidMetadata: m,
        safetyDepositTokenStore: A,
        destination: K,
        safetyDeposit: p.pubkey,
        bidder: r,
        safetyDepositConfig: b,
        auctionExtended: y,
        newMint: v,
        newEdition: E,
        newMetadata: _,
        metadata: h,
        masterEdition: D,
        editionMark: R,
        prizeTrackingTicket: B,
        winIndex: null !== I ? new BN(I) : null,
        transferAuthority: N.publicKey,
        tokenPaymentAccount: V,
        acceptPaymentAccount: P,
      }
    );
    o.addTransaction(L);
    const U = new UpdatePrimarySaleHappenedViaToken(
      {feePayer: r},
      {metadata: _, owner: r, tokenAccount: K}
    );
    o.addTransaction(U);
    const W = yield sendTransaction({
      connection: e,
      wallet: t,
      txs: i.toTransactions(),
      signers: i.signers,
    });
    yield e.confirmTransaction(W, "finalized");
    return {
      txIds: [
        W,
        yield sendTransaction({
          connection: e,
          wallet: t,
          txs: o.toTransactions(),
          signers: o.signers,
        }),
      ],
    };
  });
function isEligibleForParticipationPrize(
  e,
  {nonWinningConstraint: t, winnerConstraint: n} = {}
) {
  const a = n !== WinningConstraint.NoParticipationPrize,
    i = t !== NonWinningConstraint.NoParticipationPrize;
  return (null === e && i) || (null !== e && a);
}
const claimBid = ({
    connection: e,
    wallet: t,
    store: n,
    auction: a,
    bidderPotToken: i,
  }) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const o = t.publicKey,
        r = yield AuctionManager.getPDA(a),
        c = yield AuctionManager.load(e, r),
        d = new PublicKey(c.data.vault),
        {
          data: {tokenMint: s},
        } = yield Auction.load(e, a),
        u = new PublicKey(c.data.acceptPayment),
        l = yield AuctionExtended.getPDA(d),
        y = new PublicKey(s),
        p = yield BidderPot.getPDA(a, o),
        T = yield getClaimBidTransactions({
          auctionTokenMint: y,
          bidder: o,
          store: n,
          vault: d,
          auction: a,
          auctionExtended: l,
          auctionManager: r,
          acceptPayment: u,
          bidderPot: p,
          bidderPotToken: i,
        });
      return {
        txId: yield sendTransaction({
          connection: e,
          wallet: t,
          txs: T.toTransactions(),
          signers: T.signers,
        }),
      };
    }),
  getClaimBidTransactions = ({
    bidder: e,
    auctionTokenMint: t,
    store: n,
    vault: a,
    auction: i,
    auctionManager: o,
    auctionExtended: r,
    acceptPayment: c,
    bidderPot: d,
    bidderPotToken: s,
  }) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const u = new TransactionsBatch({transactions: []}),
        l = new ClaimBid(
          {feePayer: e},
          {
            store: n,
            vault: a,
            auction: i,
            auctionExtended: r,
            auctionManager: o,
            bidder: e,
            tokenMint: t,
            acceptPayment: c,
            bidderPot: d,
            bidderPotToken: s,
          }
        );
      return u.addTransaction(l), u;
    }),
  instantSale = ({connection: e, wallet: t, store: n, auction: a}) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const i = [],
        o = yield AuctionManager.getPDA(a),
        r = yield AuctionManager.load(e, o),
        c = yield Vault.load(e, r.data.vault),
        d = yield AuctionExtended.getPDA(c.pubkey),
        {
          data: {instantSalePrice: s},
        } = yield AuctionExtended.load(e, d),
        [u] = yield c.getSafetyDepositBoxes(e),
        l = yield SafetyDepositConfig.getPDA(o, u.pubkey),
        {
          data: {winningConfigType: y, participationConfig: p},
        } = yield SafetyDepositConfig.load(e, l),
        {txId: T, bidderPotToken: A} = yield placeBid({
          connection: e,
          wallet: t,
          amount: s,
          auction: a,
        });
      i.push(T), yield e.confirmTransaction(T, "finalized");
      const {
          data: {bidState: m},
        } = yield Auction.load(e, a),
        g = m.getWinnerIndex(t.publicKey.toBase58());
      if (null !== g) {
        switch (y) {
          case WinningConfigType.FullRightsTransfer: {
            const {txId: o} = yield redeemFullRightsTransferBid({
              connection: e,
              wallet: t,
              store: n,
              auction: a,
            });
            i.push(o);
            break;
          }
          case WinningConfigType.PrintingV2: {
            const {txId: o} = yield redeemPrintingV2Bid({
              connection: e,
              wallet: t,
              store: n,
              auction: a,
            });
            i.push(o);
            break;
          }
          default:
            throw new Error(`${y} winning type isn't supported yet`);
        }
        const {txId: o} = yield claimBid({
          connection: e,
          wallet: t,
          store: n,
          auction: a,
          bidderPotToken: A,
        });
        i.push(o);
      } else {
        const {txId: n} = yield cancelBid({
          connection: e,
          wallet: t,
          auction: a,
          bidderPotToken: A,
        });
        i.push(n);
      }
      if (isEligibleForParticipationPrize(g, p)) {
        const {txIds: i} = yield redeemParticipationBidV3({
          connection: e,
          wallet: t,
          store: n,
          auction: a,
        });
        i.push(...i);
      }
      return {txIds: i};
    }),
  burnToken = ({
    connection: e,
    wallet: t,
    token: n,
    mint: a,
    amount: i,
    owner: o,
    close: r = !0,
  }) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const c = new Transaction({feePayer: t.publicKey}).add(
        Token.createBurnInstruction(
          TOKEN_PROGRAM_ID,
          a,
          n,
          null != o ? o : t.publicKey,
          [],
          i
        )
      );
      r &&
        c.add(
          Token.createCloseAccountInstruction(
            TOKEN_PROGRAM_ID,
            n,
            t.publicKey,
            null != o ? o : t.publicKey,
            []
          )
        );
      return {
        txId: yield sendTransaction({connection: e, wallet: t, txs: [c]}),
      };
    }),
  sendToken = ({
    connection: e,
    wallet: t,
    source: n,
    destination: a,
    mint: i,
    amount: o,
  }) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const r = [],
        c = yield Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          i,
          a
        ),
        d = {feePayer: t.publicKey};
      try {
        yield Account.load(e, c);
      } catch (e) {
        r.push(
          new CreateAssociatedTokenAccount(d, {
            associatedTokenAddress: c,
            splTokenMintAddress: i,
            walletAddress: a,
          })
        );
      }
      r.push(
        new Transaction(d).add(
          Token.createTransferInstruction(
            TOKEN_PROGRAM_ID,
            n,
            c,
            t.publicKey,
            [],
            o
          )
        )
      );
      return {txId: yield sendTransaction({connection: e, wallet: t, txs: r})};
    }),
  closeVault = ({connection: e, wallet: t, vault: n, priceMint: a}) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const i = yield e.getMinimumBalanceForRentExemption(AccountLayout.span),
        o = yield Vault.getPDA(n),
        r = new TransactionsBatch({transactions: []}),
        c = {feePayer: t.publicKey},
        {
          data: {
            fractionMint: d,
            fractionTreasury: s,
            redeemTreasury: u,
            pricingLookupAddress: l,
          },
        } = yield Vault.load(e, n),
        y = new PublicKey(d),
        p = new PublicKey(s),
        T = new PublicKey(u),
        A = new PublicKey(l),
        m = new ActivateVault(c, {
          vault: n,
          numberOfShares: new BN(0),
          fractionMint: y,
          fractionTreasury: p,
          fractionMintAuthority: o,
          vaultAuthority: t.publicKey,
        });
      r.addTransaction(m);
      const g = Keypair.generate(),
        b = new CreateTokenAccount(c, {
          newAccountPubkey: g.publicKey,
          lamports: i,
          mint: y,
          owner: t.publicKey,
        });
      r.addTransaction(b), r.addSigner(g);
      const f = Keypair.generate(),
        P = new CreateTokenAccount(c, {
          newAccountPubkey: f.publicKey,
          lamports: i,
          mint: a,
          owner: t.publicKey,
        });
      r.addTransaction(P), r.addSigner(f);
      const w = Keypair.generate(),
        M = (e) =>
          new Transaction().add(
            Token.createApproveInstruction(
              TOKEN_PROGRAM_ID,
              e.publicKey,
              w.publicKey,
              t.publicKey,
              [],
              0
            )
          );
      r.addTransaction(M(f)), r.addTransaction(M(g)), r.addSigner(w);
      const k = new CombineVault(c, {
        vault: n,
        outstandingShareTokenAccount: g.publicKey,
        payingTokenAccount: f.publicKey,
        fractionMint: y,
        fractionTreasury: p,
        redeemTreasury: T,
        burnAuthority: o,
        externalPriceAccount: A,
        transferAuthority: w.publicKey,
        vaultAuthority: t.publicKey,
        newVaultAuthority: t.publicKey,
      });
      r.addTransaction(k);
      return {
        txId: yield sendTransaction({
          connection: e,
          signers: r.signers,
          txs: r.transactions,
          wallet: t,
        }),
      };
    }),
  createExternalPriceAccount = ({connection: e, wallet: t}) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const n = new TransactionsBatch({transactions: []}),
        a = {feePayer: t.publicKey},
        i = yield e.getMinimumBalanceForRentExemption(
          Vault.MAX_EXTERNAL_ACCOUNT_SIZE
        ),
        o = Keypair.generate(),
        r = new ExternalPriceAccountData({
          pricePerShare: new BN(0),
          priceMint: NATIVE_MINT.toBase58(),
          allowedToCombine: !0,
        }),
        c = new Transaction().add(
          SystemProgram.createAccount({
            fromPubkey: t.publicKey,
            newAccountPubkey: o.publicKey,
            lamports: i,
            space: Vault.MAX_EXTERNAL_ACCOUNT_SIZE,
            programId: VaultProgram.PUBKEY,
          })
        );
      n.addTransaction(c), n.addSigner(o);
      const d = new UpdateExternalPriceAccount(a, {
        externalPriceAccount: o.publicKey,
        externalPriceAccountData: r,
      });
      n.addTransaction(d);
      return {
        txId: yield sendTransaction({
          connection: e,
          signers: n.signers,
          txs: n.transactions,
          wallet: t,
        }),
        externalPriceAccount: o.publicKey,
        priceMint: NATIVE_MINT,
      };
    }),
  createVault = ({
    connection: e,
    wallet: t,
    priceMint: n = NATIVE_MINT,
    externalPriceAccount: a,
  }) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const i = yield e.getMinimumBalanceForRentExemption(AccountLayout.span),
        o = yield e.getMinimumBalanceForRentExemption(MintLayout.span),
        r = yield e.getMinimumBalanceForRentExemption(Vault.MAX_VAULT_SIZE),
        c = Keypair.generate(),
        d = yield Vault.getPDA(c.publicKey),
        s = new TransactionsBatch({transactions: []}),
        u = Keypair.generate(),
        l = new CreateMint(
          {feePayer: t.publicKey},
          {
            newAccountPubkey: u.publicKey,
            lamports: o,
            owner: d,
            freezeAuthority: d,
          }
        );
      s.addTransaction(l), s.addSigner(u);
      const y = Keypair.generate(),
        p = new CreateTokenAccount(
          {feePayer: t.publicKey},
          {newAccountPubkey: y.publicKey, lamports: i, mint: n, owner: d}
        );
      s.addTransaction(p), s.addSigner(y);
      const T = Keypair.generate(),
        A = new CreateTokenAccount(
          {feePayer: t.publicKey},
          {
            newAccountPubkey: T.publicKey,
            lamports: i,
            mint: u.publicKey,
            owner: d,
          }
        );
      s.addTransaction(A), s.addSigner(T);
      const m = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: t.publicKey,
          newAccountPubkey: c.publicKey,
          lamports: r,
          space: Vault.MAX_VAULT_SIZE,
          programId: VaultProgram.PUBKEY,
        })
      );
      s.addTransaction(m), s.addSigner(c);
      const g = new InitVault(
        {feePayer: t.publicKey},
        {
          vault: c.publicKey,
          vaultAuthority: t.publicKey,
          fractionalTreasury: T.publicKey,
          pricingLookupAddress: a,
          redeemTreasury: y.publicKey,
          fractionalMint: u.publicKey,
          allowFurtherShareCreation: !0,
        }
      );
      s.addTransaction(g);
      return {
        txId: yield sendTransaction({
          connection: e,
          signers: s.signers,
          txs: s.transactions,
          wallet: t,
        }),
        vault: c.publicKey,
        fractionMint: u.publicKey,
        redeemTreasury: y.publicKey,
        fractionTreasury: T.publicKey,
      };
    }),
  initAuction = ({connection: e, wallet: t, vault: n, auctionSettings: a}) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const i = {feePayer: t.publicKey},
        [o, r] = yield Promise.all([
          Auction.getPDA(n),
          AuctionExtended.getPDA(n),
        ]),
        c = new CreateAuctionArgs(
          Object.assign(Object.assign({}, a), {
            authority: t.publicKey.toBase58(),
            resource: n.toBase58(),
          })
        ),
        d = new CreateAuction(i, {
          args: c,
          auction: o,
          creator: t.publicKey,
          auctionExtended: r,
        });
      return {
        txId: yield sendTransaction({
          connection: e,
          signers: [],
          txs: [d],
          wallet: t,
        }),
        auction: o,
      };
    });
var index$1 = Object.freeze({
    __proto__: null,
    addTokensToVault: addTokensToVault,
    sendTransaction: sendTransaction,
    initStore: initStore,
    initStoreV2: initStoreV2,
    mintNFT: mintNFT,
    mintEditionFromMaster: mintEditionFromMaster,
    createMetadata: createMetadata,
    createMasterEdition: createMasterEdition,
    signMetadata: signMetadata,
    updateMetadata: updateMetadata,
    cancelBid: cancelBid,
    getCancelBidTransactions: getCancelBidTransactions,
    placeBid: placeBid,
    redeemFullRightsTransferBid: redeemFullRightsTransferBid,
    getRedeemFRTBidTransactions: getRedeemFRTBidTransactions,
    getBidRedemptionPDA: getBidRedemptionPDA,
    redeemPrintingV2Bid: redeemPrintingV2Bid,
    getRedeemPrintingV2BidTransactions: getRedeemPrintingV2BidTransactions,
    getEditionOffset: getEditionOffset,
    redeemParticipationBidV3: redeemParticipationBidV3,
    isEligibleForParticipationPrize: isEligibleForParticipationPrize,
    claimBid: claimBid,
    getClaimBidTransactions: getClaimBidTransactions,
    instantSale: instantSale,
    burnToken: burnToken,
    sendToken: sendToken,
    prepareTokenAccountAndMintTxs: prepareTokenAccountAndMintTxs,
    createWrappedAccountTxs: createWrappedAccountTxs,
    createApproveTxs: createApproveTxs,
    closeVault: closeVault,
    createExternalPriceAccount: createExternalPriceAccount,
    createVault: createVault,
    initAuction: initAuction,
  }),
  index = Object.freeze({
    __proto__: null,
    transactions: index$2,
    auction: mplAuction,
    core: mplCore,
    metaplex: mplMetaplex,
    metadata: mplTokenMetadata,
    vault: mplTokenVault,
  });
export {
  ArweaveStorage,
  ChainId,
  Coingecko,
  Connection,
  Currency,
  ENV,
  NodeWallet,
  index$1 as actions,
  index as programs,
  Storage$1 as storage,
  index$2 as transactions,
  index$3 as utils,
};
//# sourceMappingURL=/sm/5fbca5773740c010a7f1223fade0c3d97a0c83c7f1e656592c8499edeae160f5.map
