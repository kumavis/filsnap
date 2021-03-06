import {EmptyMetamaskState, Wallet} from "./interfaces";
import {FilecoinEventApi} from "@nodefactory/filsnap-types";
import {getAddress} from "./rpc/getAddress";
import {exportPrivateKey} from "./rpc/exportPrivateKey";
import {getPublicKey} from "./rpc/getPublicKey";
import {getApi} from "./filecoin/api";
import {LotusRpcApi} from "./filecoin/types";
import {getBalance} from "./rpc/getBalance";
import {configure} from "./rpc/configure";
import {updateAsset} from "./asset";
import {getMessages} from "./rpc/getMessages";
import {signMessage, signMessageRaw} from "./rpc/signMessage";
import {sendMessage} from "./rpc/sendMessage";

declare let wallet: Wallet;

const apiDependentMethods = [
  "getBalance", "signMessage", "sendMessage"
];

wallet.registerApiRequestHandler(async function (origin: URL): Promise<FilecoinEventApi> {
  return {};
});

wallet.registerRpcMessageHandler(async (originString, requestObject) => {
  const state = wallet.getPluginState();
  if (!state) {
    // initialize state if empty and set default config
    wallet.updatePluginState(EmptyMetamaskState());
  }

  let api: LotusRpcApi;
  // initialize lotus RPC api if needed
  if (apiDependentMethods.indexOf(requestObject.method) >= 0) {
    api = getApi(wallet);
  }

  switch (requestObject.method) {
    case "configure":
      const configuration = configure(
        wallet, requestObject.params.configuration.network, requestObject.params.configuration
      );
      console.log(configuration);
      api = getApi(wallet);
      await updateAsset(wallet, originString, await getBalance(wallet, api));
      return configuration;
    case "getAddress":
      return await getAddress(wallet);
    case "getPublicKey":
      return await getPublicKey(wallet);
    case "exportPrivateKey":
      return exportPrivateKey(wallet);
    case "getBalance":
      const balance = await getBalance(wallet, api);
      await updateAsset(wallet, originString, balance);
      return balance;
    case "getMessages":
      return getMessages(wallet);
    case "signMessage":
      return await signMessage(wallet, api, requestObject.params.message);
    case "signMessageRaw":
      return await signMessageRaw(wallet, requestObject.params.message);
    case "sendMessage":
      return await sendMessage(wallet, api, requestObject.params.signedMessage);
    default:
      throw new Error("Unsupported RPC method");
  }
});
