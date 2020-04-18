import React, { useEffect, useState } from 'react'
import getWeb3 from '../getWeb3'
import loadFirebase from '../firebase'
import postToBlockNative from '../blocknative'

const Index = () => {

  const [web3, setWeb3] = useState(undefined)
  const [transactions, setTransactions] = useState(undefined)

  useEffect(() => {
    loadWeb3()
    loadTransactions()
  }, [])

  async function loadWeb3() {
    const web3 = await getWeb3()
    setWeb3(web3.web3)
  }

  async function loadTransactions() {
    const firebase = await loadFirebase()
    firebase.firestore().collection("transactions").onSnapshot((snapshot) => {
      setTransactions(snapshot.docs)
    })
  }

  async function handleClick() {

    if (web3) {

      const firebase = await loadFirebase()
      const accounts = await web3.eth.getAccounts()

      const txObject = {
        from: accounts[0],
        to: "0x94cb5C277FCC64C274Bd30847f0821077B231022",
        value: web3.utils.toWei("0.001", "ether"),
        gas: 21000,
        gasPrice: web3.utils.toWei("20", "gwei")
      }

      await web3.eth.sendTransaction(txObject)
        .on('transactionHash', async function (hash: string) {

          firebase.firestore().collection("transactions").doc(hash).set({
            status: "pending"
          })
            .then(async (result) => {
              const bn = await postToBlockNative(hash)
              console.log('bn:', bn)
            })
        })
    }
  }

  return (

    <div className="container">
      Click the button to send a transaction! (Make sure you're on Ropsten)
      <button onClick={() => handleClick()}>Send 0.001 ETH</button>

      <div style={{ height: 40 }}></div>

      {transactions && transactions.map((txSnapshot) => {
        const data = txSnapshot!.data()

        return (
          <div>
            {txSnapshot.id} - {data.status}
          </div>
        )
      })}



      <style jsx>{`
      .container {
        min-height: 100vh;
        padding: 0 0.5rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      button {
        width:200px;
        height:50px;
      }


    `}</style>
    </div>

  )

}

export default Index
