import { useState } from "react";
import { useSyncProviders } from "../hooks/useSyncProviders";
import { formatAddress } from "../utils";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import web3 from "../web3";
import lottery from "../lottery";

interface Props {
  providers: EIP6963ProviderDetail[];
  userAccount: string;
  wallet: EIP6963ProviderDetail | undefined;
  showProviders: boolean;
  setShowProviders: React.Dispatch<React.SetStateAction<boolean>>;
  onConnect: (providerWithInfo: EIP6963ProviderDetail) => Promise<void>;
  isManager: boolean;
  manager: string
}

export const DiscoverWalletProviders = ({
  providers,
  userAccount,
  onConnect,
  setShowProviders,
  showProviders,
  wallet,
  isManager,
  manager
}: Props) => {
  // Display detected providers as connect buttons.
  return (
    <>
      {providers.length > 0 ? (
        <div className='h-24 flex items-center flex-col justify-center'>
          {!userAccount || showProviders ? (
            <>
              <h3 className='font-semibold text-lg pb-2 text-zinc-300'>
                Wallets Detected:
              </h3>

              <div className='flex flex-row gap-3.5'>
                {providers?.map((provider: EIP6963ProviderDetail) => (
                  <button
                    key={provider.info.uuid}
                    className='items-center flex flex-col gap-1 rounded-md hover:bg-zinc-600 transition-all shadow-none hover:shadow-2xl justify-center bg-zinc-700 p-3'
                    onClick={() => onConnect(provider)}
                  >
                    <img src={provider.info.icon} alt={provider.info.name} />
                  </button>
                ))}
              </div>
              {!userAccount && (
                <h4 className='text-base font-normal pt-2 text-slate-500'>
                  No wallet selected. Please select a wallet
                </h4>
              )}
            </>
          ) : (
            <button
              type='button'
              onClick={() => setShowProviders(() => true)}
              className=' text-lg  text-zinc-300'
            >
              Show detected wallets <KeyboardArrowDownIcon />{" "}
            </button>
          )}
        </div>
      ) : (
        <div className='flex flex-col'>
          <h3 className='text-2xl font-medium pb-2'>
            No Announced Wallet Providers!
          </h3>
          <p className='text-lg text-slate-500'>
            Please add a wallet to your browser to continue (e.g.{" "}
            <a
              className='text-blue-400 hover:underline'
              href='https://metamask.io/'
            >
              Metamask
            </a>
            ,{" "}
            <a
              className='text-blue-400 hover:underline'
              href='https://www.coinbase.com/en-tr/wallet'
            >
              Coinbase
            </a>
            )
          </p>
        </div>
      )}
      <hr className='h-4' />

      {/* <h3>{userAccount ? "" : "No "}Wallet Selected</h3> */}
      {userAccount && wallet && (
        <div className='absolute top-8 left-8'>
          <div>
            <div className='flex items-start flex-row gap-2.5'>
              <button type="button" onClick={async () => {
                const accounts = await web3.eth.getAccounts();
                const contractManager = await lottery.methods.manager().call()
                console.log('State user: ', userAccount)
                console.log('Contract user: ', accounts[0])
                console.log('Contract Manager: ', contractManager)
                console.log("State Manager: ", manager);
                console.log("is manager: ", userAccount === manager);
                console.log("is manager contract: ", accounts[0] === contractManager);
                console.log('is manager state: ', isManager)
              }}>
                <img src={wallet.info.icon} alt={wallet.info.name} />
              </button>

              <span className='flex flex-row items-center gap-2'>
                <p className='text-zinc-400 font-normal'>{wallet.info.name}:</p>
                <p className='text-lg font-semibold'>
                  ({formatAddress(userAccount)})
                </p>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
