import { useState, useEffect } from 'react';
import { ethers, utils } from "ethers";
import abi from "./contracts/Bank.json";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isBankerOwner, setIsBankerOwner] = useState(false);
  const [inputValue, setInputValue] = useState({ withdraw: "", deposit: "", bankName: "" });
  const [bankOwnerAddress, setBankOwnerAddress] = useState(null);
  const [customerTotalBalance, setCustomerTotalBalance] = useState(null);
  const [currentBankName, setCurrentBankName] = useState(null);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [error, setError] = useState(null);

  const contractAddress = '0x8Ad473567B0FC601267Af9A451Be75875D7003f4';
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0];
        setIsWalletConnected(true);
        setCustomerAddress(account);
        console.log("Account Connected: ", account);
      } else {
        setError("Please install a MetaMask wallet to use our bank.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getBankName = async () => {
    try {
      if (window.ethereum) {

        //read data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);

        let bankName = await bankContract.bankName();
        bankName = utils.parseBytes32String(bankName);
        setCurrentBankName(bankName.toString());
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const setBankNameHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await bankContract.setBankName(utils.formatBytes32String(inputValue.bankName));
        console.log("Setting Bank Name...");
        await txn.wait();
        console.log("Bank Name Changed", txn.hash);
        getBankName();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getbankOwnerHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);

        let owner = await bankContract.bankOwner();
        setBankOwnerAddress(owner);

        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (owner.toLowerCase() === account.toLowerCase()) {
          setIsBankerOwner(true);
        }
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const customerBalanceHanlder = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);

        let balance = await bankContract.getCustomerBalance();
        setCustomerTotalBalance(utils.formatEther(balance));
        console.log("Retrieved balance...", balance);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }

  const deposityMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        //write data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await bankContract.depositMoney({ value: ethers.utils.parseEther(inputValue.deposit) });
        console.log("Deposting money...");
        await txn.wait();
        console.log("Deposited money...done", txn.hash);

        customerBalanceHanlder();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const withDrawMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);

        let myAddress = await signer.getAddress()
        console.log("provider signer...", myAddress);

        const txn = await bankContract.withDrawMoney(myAddress, ethers.utils.parseEther(inputValue.withdraw));
        console.log("Withdrawing money...");
        await txn.wait();
        console.log("Money with drew...done", txn.hash);

        customerBalanceHanlder();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getBankName();
    getbankOwnerHandler();
    customerBalanceHanlder()
  }, [isWalletConnected])

  return (
    <main className="main-container">
      <div class="body-title">
        <h2 className="headline"><span className="headline-gradient">aromamoon Bank Contract Project</span> 💰</h2>
      </div>
      <div class="container">
        <div class="row">
          <div class="col-xxl-2 col-xl-2 col-lg-2 col-md-12 col-sm-12"></div>
          <div class="col-xxl-8 col-xl-8 col-lg-8 col-md-12 col-sm-12">
            <div class="bodytitle">
              <div class="body-info">
                <section className="customer-section px-10 pt-5 pb-10">
                  {error && <p className="text-2xl text-red-700">{error}</p>}
                  <div className="mt-5">
                    {currentBankName === "" && isBankerOwner ?
                      <p>"Setup the name of your bank." </p> :
                      <p className="text-3xl font-bold">{currentBankName}</p>
                    }
                  </div>
                  <form className="">
                    <input
                      type="text"
                      className="form-control col-md-12 info"
                      onChange={handleInputChange}
                      name="deposit"
                      placeholder="0.0000 ETH"
                      value={inputValue.deposit}
                    />
                    <button
                      className="btn btn-primary col-md-12"
                      onClick={deposityMoneyHandler}>Deposit Money In ETH</button>
                  </form> 

                  <div class="withdraw">
                    <form className="">
                      <input
                        type="text"
                        className="form-control col-md-12 info"
                        onChange={handleInputChange}
                        name="withdraw"
                        placeholder="0.0000 ETH"
                        value={inputValue.withdraw}
                      />
                      <button
                        className="btn btn-primary col-md-12"
                        onClick={withDrawMoneyHandler}>
                        Withdraw Money In ETH
                      </button>
                    </form>
                  </div>
                  <div className="mt-5">
                    <p><span className="font-bold">Customer Balance: </span>{customerTotalBalance}</p>
                  </div>
                  <div className="mt-5">
                    <p><span className="font-bold">Bank Owner Address: </span>{bankOwnerAddress}</p>
                  </div>
                  <div className="mt-5">
                    {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{customerAddress}</p>}
                    <button className="btn btn-secondary btn-lg" onClick={checkIfWalletIsConnected}>
                      {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
                    </button>
                  </div>
                </section>
                {
                  isBankerOwner && (
                    <section className="bank-owner-section">
                      <h2 className="text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold">Bank Admin Panel</h2>
                      <div className="p-10">
                        <form className="form-style">
                          <input
                            type="text"
                            className="input-style"
                            onChange={handleInputChange}
                            name="bankName"
                            placeholder="Enter a Name for Your Bank"
                            value={inputValue.bankName}
                          />
                          <button
                            className="btn-grey"
                            onClick={setBankNameHandler}>
                            Set Bank Name
                          </button>
                        </form>
                      </div>
                    </section>
                  )
                }
              </div>  
            </div>    
          </div>
        </div>  
      </div>  
    </main>
  );
}
export default App;