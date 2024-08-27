import React, { FormEventHandler, useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { DiscoverWalletProviders } from "./components/DiscoverWalletProviders";
import lottery from "./lottery";
import { formatAddress, formatBalance } from "./utils/index";
import web3 from "./web3";
import { useSyncProviders } from "./hooks/useSyncProviders";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Loader2 } from "lucide-react";

function App() {
  const [manager, setManager] = useState<string>("");
  const [players, setPlayers] = useState<string[]>([]);
  const [balance, setBalance] = useState("");
  const [showProviders, setShowProviders] = useState(true);
  const [userAccount, setUserAccount] = useState<string>("");
  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>();
  const providers = useSyncProviders();
  const [value, setValue] = useState<string>("");
  const [isEnterLoading, setIsEnterLoading] = useState(false);
  const [isWinnerLoading, setIsWinnerLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isManager, setIsManager] = useState(false);

  const step = 0.0001;

  // Connect to the selected provider using eth_requestAccounts.
  const handleConnect = async (providerWithInfo: EIP6963ProviderDetail) => {
    try {
      const accounts = (await providerWithInfo.provider.request({
        method: "eth_requestAccounts",
      })) as React.SetStateAction<string>[];

      setSelectedWallet(value => providerWithInfo);
      setShowProviders(value => false);
      console.log('prev user state: ', userAccount)
      setUserAccount(
        (value) => (value = accounts?.[0].toString().toUpperCase()),
      );
      console.log("new user state: ", userAccount);
      setIsManager(userAccount === manager)
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit: FormEventHandler | undefined = async (event) => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();

    setIsEnterLoading(true);

    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(value, "ether"),
    });

    setIsEnterLoading(false);
  };

  const handleWinnerClick = async () => {
    const accounts = await web3.eth.getAccounts();

    setIsWinnerLoading(true);

    await lottery.methods.pickWinner().send({
      from: accounts[0],
    });

    setIsWinnerLoading(false);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // Define the desired step precision (e.g., 0.01 allows two decimal places)
    const stepDecimals = step.toString().split(".")[1]?.length || 0;

    // Regex to match numbers with the specified precision
    const regex = new RegExp(`^\\d*(\\.\\d{0,${stepDecimals}})?$`);

    if (regex.test(value)) {
      setValue(value);
    }
  };

  useEffect(() => {
    const initManager = async () => {
      const contract = lottery.methods;

      try {
        const contractManager = await contract.manager().call();
        console.log("contractManager: ", contractManager);

        const contractPlayers:string[] = await contract.getPlayers().call() as string[];
        const contractBalance = await web3.eth.getBalance(
          lottery.options.address,
        );

        setManager(contractManager.toUpperCase());
        setPlayers([...new Set(contractPlayers)]);
        setBalance(contractBalance);
        setIsDataLoading(false);
      } catch (e) {
        console.log("AN ERROR HAS OCCURRED WHILE FETCHING DATA:");
        console.log(e);
      }
    };

    // Call the async function inside useEffect
    initManager();

    // Empty dependency array ensures this only runs once
  }, []);


  return (
    <div className='App h-full pt-56 '>
      <header className='absolute top-48'>
        {isDataLoading ? (
          <div className='flex flex-col items-center gap-4'>
            <h1 className='text-3xl'>Loading</h1>
            <Loader2 className=' animate-spin duration-500 h-8 w-8' />
          </div>
        ) : (
          <>
            <div className='pb-24 flex flex-col'>
              {userAccount.toUpperCase() === manager.toUpperCase() ? (
                <p className='text-lg text-slate-400'>
                  You are manager of this contract is.
                </p>
              ) : (
                <p className='text-lg text-slate-400'>
                  The manager of this contract is{" "}
                  <strong>{formatAddress(manager)}</strong>.
                </p>
              )}
              <h1 className='text-3xl max-w-3xl '>
                {" "}
                There are <strong>{players.length}</strong>{" "}
                {players.length === 1 ? "person" : "people"} entered, competing
                to win <strong>{web3.utils.fromWei(balance, "ether")}</strong>{" "}
                ether!
              </h1>
            </div>
          </>
        )}
      </header>

      {userAccount && (
        <form
          onSubmit={handleSubmit}
          className='pb-16 space-y-4 items-center flex flex-col'
        >
          <p className='text-xs text-zinc-500'>
            At least <strong>0.02 ether</strong> must be sent to enter
          </p>
          <div className=' flex flex-row items-center space-x-2'>
            <p className='text-2xl text-zinc-300'>ETH: </p>
            <Input
              type='number'
              inputMode='decimal'
              step='0.00001'
              required
              value={value}
              onChange={handleValueChange}
              className='bg-zinc-700 border-gray-500 focus-visible:border-gray-300 transition-all text-lg font-bold w-32 disabled:bg-red-600 '
            />
          </div>
          <Button
            type='submit'
            variant='secondary'
            disabled={isEnterLoading || isWinnerLoading}
            className='font-bold text-[#282c34] bg-neutral-300 w-min transition-all'
          >
            {isEnterLoading && (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            )}
            Enter the Lottery
          </Button>
        </form>
      )}

      {manager !== "" &&
        userAccount.toUpperCase() === manager.toUpperCase() && (
          <div className='absolute top-8 right-8'>
            <div className=' hover:animate-bounce hover:duration-1000 hover:py-4'>
              <Button
                disabled={isEnterLoading || isWinnerLoading}
                onClick={handleWinnerClick}
                variant='outline'
                className='h-14 px-8 font-black '
              >
                {isWinnerLoading && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                Pick a winner!
              </Button>
            </div>
          </div>
        )}

      <DiscoverWalletProviders
        showProviders={showProviders}
        manager={manager}
        onConnect={handleConnect}
        providers={providers}
        userAccount={userAccount}
        wallet={selectedWallet}
        setShowProviders={setShowProviders}
        isManager={isManager}
      />
    </div>
  );
}

export default App;
