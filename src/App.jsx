import React, { useEffect, useState } from 'react'
import './App.css'
import TonWeb from 'tonweb'
import * as constants from '../constants.config'
import logo from './assets/logo.png'
import { useAlert } from 'react-alert'
import { EXPLORER_URL } from '../constants.config'

const { NftCollection, NftItem, NftMarketplace, NftSale } = TonWeb.token.nft

// TonWeb API

const tonweb = new TonWeb(new TonWeb.HttpProvider(
  constants.NETWORK,
  {
    apiKey: constants.API_KEY,
  }))

const App = () => {
  const alert = useAlert()

  const [walletHistory, setWalletHistory] = useState({})
  const [walletAddress, setWalletAddress] = useState('')

  // collection settings
  const [url, setUrl] = useState('')
  const [royalty, setRoyalty] = useState('')
  const [nftItemsUrl, setNftItemsUrl] = useState('')
  const [nftCollection, setNftCollection] = useState(null)
  const [collectionAddress, setCollectionAddress] = useState(null)
  const [collectionHistory, setCollectionHistory] = useState({})
  const [nfts, setNfts] = useState(null)

  // nft item settings
  const [nftIndex, setNftIndex] = useState('')
  const [nftContentFile, setNftContentFile] = useState('')

  // page settings
  const [loading, setLoading] = useState(false)

  const onUrlChange = (event) => {
    setUrl(event.target.value)
  }
  const onRoyaltyChange = (event) => {

    setRoyalty(event.target.value)
  }

  const onNftItemsUrlChange = (event) => {
    setNftItemsUrl(event.target.value)
  }

  const onNftIndexChange = (event) => {
    setNftIndex(event.target.value)
  }
  const onNftContentFileChange = (event) => {
    setNftContentFile(event.target.value)
  }

  const connectWallet = async () => {
    setLoading(true)

    try {
      if (window.tonProtocolVersion || window.tonProtocolVersion > 1) {
        if (window.ton.isTonWallet) {
          console.log('TON Wallet Extension found!')
        }

        const provider = window.ton
        const accounts = await provider.send('ton_requestWallets')

        const walletAddress = new TonWeb.utils.Address(
          accounts[0].address)

        console.log('Connected accounts:',
          accounts)

        console.log('Connected wallet address:',
          walletAddress.toString(true, true, true))

        setWalletAddress(walletAddress)
        setWalletHistory(await tonweb.getTransactions(walletAddress))

      } else {
        alert('Please update your TON Wallet Extension 💎')
        location.href = 'https://chrome.google.com/webstore/detail/ton-wallet/nphplpgoakhhjchkkhmiggakijnkhfnd'
      }

    } catch (e) {
      console.error(e)
    }

    setLoading(false)
  }

  const getCollectionInfo = async () => {
    const collection = collection
  }

  /**
   * Deploy a new NFT Collection to the blockchain
   */
  const deployNftCollection = async () => {
    setLoading(true)

    const provider = window.ton

    const nftCollection = new NftCollection(tonweb.provider, {
      ownerAddress: walletAddress, // owner of the collection
      royalty: royalty / 100, // royalty in %
      royaltyAddress: walletAddress, // address to receive the royalties
      collectionContentUri: url, // url to the collection content
      nftItemContentBaseUri: nftItemsUrl, // url to the nft item content
      nftItemCodeHex: NftItem.codeHex, // format of the nft item
    })
    console.log('Collection data:',
      nftCollection)
    const nftCollectionAddress = await nftCollection.getAddress()

    // check if the collection already exists
    let addresses = new Set()
    walletHistory.forEach(el => {
      try {
        addresses.add(el.out_msgs[0].destination)
      } catch (e) {}
    })

    if (addresses.has(nftCollectionAddress.toString(true, true, true))) {
      console.log('Collection already deployed!')
      alert.show(
        'Collection already in blockchain 💎 — feel free to add new NFTs!')

      setNftCollection(nftCollection)
      setCollectionAddress(nftCollectionAddress)
      setCollectionHistory(await tonweb.getTransactions(nftCollectionAddress))

      await getInfo(nftCollection)

      setLoading(false)
      return
    }

    console.log('Collection address (changes with provided data):',
      nftCollectionAddress.toString(true, true, true))

    const stateInit = (await nftCollection.createStateInit()).stateInit
    const stateInitBoc = await stateInit.toBoc(false)
    const stateInitBase64 = TonWeb.utils.bytesToBase64(stateInitBoc)

    provider.send(
      'ton_sendTransaction',
      [
        {
          to: (nftCollectionAddress).toString(true, true, true),
          value: TonWeb.utils.toNano(0.05.toString()).toString(), // 0.05 TON to cover the gas
          stateInit: stateInitBase64,
          dataType: 'boc',
        }],
    ).then(res => {
      // we get TRUE or FALSE

      if (res) {
        console.log('Transaction successful')
        alert.show('Transaction successful')

        setCollectionAddress(nftCollectionAddress)
        setNftCollection(nftCollection)
      } else {
        console.log('Wallet didn\'t approved minting transaction')
        alert.show('Wallet didn\'t approved minting transaction')
      }

      setLoading(false)
    }).catch(err => {
      alert.show('Error, open the console to see the error')
      console.error(err)
      setLoading(false)
    })

  }

  const deployNftItem = async () => {
    setLoading(true)

    const provider = window.ton
    const amount = TonWeb.utils.toNano(0.05.toString())

    const body = await nftCollection.createMintBody({
      amount: amount,
      itemIndex: nftIndex,
      itemContentUri: nftContentFile,
      itemOwnerAddress: walletAddress,
    })

    const bodyBoc = await body.toBoc(false)
    const bodyBase64 = TonWeb.utils.bytesToBase64(bodyBoc)

    let collectionNftData = new Set()
    collectionHistory.forEach(el => {
      try {
        collectionNftData.add(el.in_msg.msg_data.body)
      } catch (e) {}
    })

    // check if the NFT exists in the collection
    if (collectionNftData.has(bodyBase64)) {
      console.log('NFT already deployed!')
      alert.show('This NFT already deployed 💎')

      setNfts(true)
      setLoading(false)
      return
    }

    provider.send(
      'ton_sendTransaction',
      [
        {
          to: collectionAddress.toString(true, true, true),
          value: amount.toString(),
          data: bodyBase64,
          dataType: 'boc',
        }],
    ).then(res => {

      if (res) {
        console.log('Transaction successful')
        alert.show('Transaction successful')
      } else {
        console.log('Wallet didn\'t approved minting transaction')
        alert.show('Wallet didn\'t approved minting transaction')
      }

      setLoading(false)
    }).catch(err => {
      alert.show('Error, open the console to see the error')
      console.log(err)
      setLoading(false)
    })
  }

  const addNftItem = async () => {
    setNftIndex('')
    setNftContentFile('')
    setNfts(false)
  }

  const getInfo = async (nftCollection) => {
    setLoading(true)

    try {

      const data = await nftCollection.getCollectionData()
      data.ownerAddress = data.ownerAddress.toString(true, true, true)

      console.log('Collection data:')
      console.log(data)

      const royaltyParams = await nftCollection.getRoyaltyParams()
      royaltyParams.royaltyAddress = royaltyParams.royaltyAddress.toString(true,
        true, true)
      console.log('Collection royalty params:')
      console.log(royaltyParams)

      const nftItemAddress0 = (await nftCollection.getNftItemAddressByIndex(
        0)).toString(true, true, true)
      console.log('NFT "item 0" address:')
      console.log(nftItemAddress0)

      const nftItem = new NftItem(tonweb.provider, { address: nftItemAddress0 })

      const nftData = await nftCollection.methods.getNftItemContent(nftItem)
      nftData.collectionAddress = nftData.collectionAddress.toString(true, true,
        true)

      nftData.ownerAddress = nftData.ownerAddress?.toString(true, true, true)
      console.log('NFT "item 0" data:')
      console.log(nftData)

    } catch (e) {
      console.log(e)

      setTimeout(() => {
        alert.show('Error to parse collection info, open the console to see the error')
      }, 3100)
    }
    setLoading(false)
  }

  const renderConnectWalletContainer = () => (
    <button
      className={'cta-button primary-button'}
      onClick={connectWallet}>Connect TON Wallet</button>
  )

  const renderCreateCollectionContainer = () => (
    <div className={'connected-container'}>

      <form onSubmit={(event) => {
        event.preventDefault()
        deployNftCollection()
      }}>
        <div className="">
          <p>
            <input type="text"
                   placeholder={'Collection content — URL to .json file'}
                   value={url}
                   onChange={onUrlChange} />
          </p>
          <p>
            <input type="text"
                   placeholder={'NFT content — URL where NFT files are stored'}
                   value={nftItemsUrl}
                   onChange={onNftItemsUrlChange} />
          </p>
          <p>
            <input max={'100'} type="text" placeholder={'Royalty (0-100%)'}
                   value={royalty}
                   onChange={onRoyaltyChange} />
          </p>
        </div>

        <div className="">
          <button type={'submit'}
                  className={'cta-button secondary-button'}>Create collection
          </button>
        </div>
      </form>

    </div>
  )

  const renderCreateNFTContainer = () => (
    <div className={'connected-container'}>

      <form onSubmit={(event) => {
        event.preventDefault()
        deployNftItem()
      }}>
        <div className="">
          <p>
            <input type="text"
                   placeholder={'NFT index — unique index of the NFT. Starts from 0'}
                   value={nftIndex}
                   onChange={onNftIndexChange} />
          </p>
          <p>
            <input type="text"
                   placeholder={'NFT content — name of .json file with NFT params'}
                   value={nftContentFile}
                   onChange={onNftContentFileChange} />
          </p>
        </div>

        <div className="">
          <button type={'submit'}
                  className={'cta-button primary-button'}>Create NFT
          </button>
        </div>

        {nfts}
        <div className="">

        </div>
      </form>

    </div>
  )
  const renderResultContainer = () => (
    <div className={'connected-container'}>

      <div className="">
        <a href={EXPLORER_URL + '/nft/' +
          collectionAddress.toString(true, true, true)} target={'_blank'}>
          <button className={'cta-button primary-button'}>
            See collection in TonScan Explorer
          </button>
        </a>
      </div>

      <p>
        <a href={'#'} className={'return-button'} onClick={addNftItem}>
          Create more NFT
        </a>
      </p>
    </div>
  )

  // useEffect(() => {
  //   if (walletAddress) {
  //     getCollectionInfo()
  //   }
  // }, [collectionData])

  return (
    <div className="App">
      <div className={nftCollection ? 'authed-container' : 'container'}>
        <div className="header-container">

          <p className="header">🖼 <span
            className={'gradient-text'}>TON Minter</span></p>
          <p className="sub-text">
            {!walletAddress &&
              'Deploy your first NFT collection in TON testnet — it\'s free! ✨'}

            {(walletAddress && !collectionAddress) &&
              'Step 1: Prepare your NFT collection to add it to the blockchain'}

            {(walletAddress && collectionAddress && !nfts) &&
              'Step 2: Mint your first NFTs 🙈'}

            {(walletAddress && collectionAddress && nfts) &&
              'Step 3: See the result in the explorer 🚀'}
          </p>

          {loading && (<div className="loading-container">
            <div className="lds-dual-ring">
            </div>
          </div>)}

          {!walletAddress && renderConnectWalletContainer()}
          {(walletAddress && !collectionAddress && !nfts && !loading) &&
            renderCreateCollectionContainer()}
          {(walletAddress && collectionAddress && !nfts && !loading) &&
            renderCreateNFTContainer()}
          {(walletAddress && collectionAddress && nfts && !loading) &&
            renderResultContainer()}

        </div>

        <div className={walletAddress
          ? 'footer-container footer-relative'
          : 'footer-container'}>
          <p className={'footer-text'}>
            Made by <img width={20} style={{ verticalAlign: 'middle' }}
                         src={logo} alt="" /> <a className={'footer-text'}
                                                 href="#"> TON Builders</a> team
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
