import {SnapRpcMethodRequest} from "@nodefactory/filsnap-types";
import {enableFilecoinSnap, MetamaskFilecoinSnap} from "@nodefactory/filsnap-adapter";

declare global {
    interface Window {
        ethereum: {
            isMetaMask: boolean;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            send: <T>(request: SnapRpcMethodRequest | {method: string; params?: any[]}) => Promise<T>;
            on: (eventName: unknown, callback: unknown) => unknown;
            // requestIndex: () => Promise<{getPluginApi: (origin: string) => Promise<FilecoinApi>}>;
        }
    }
}

export const origin = new URL('package.json', 'http://localhost:8081').toString();
export const pluginId = `wallet_plugin_${origin}`;

let isInstalled: boolean = false;

export interface SnapInitializationResponse {
    isSnapInstalled: boolean;
    snap?: MetamaskFilecoinSnap;
}

export async function installFilecoinSnap(): Promise<SnapInitializationResponse> {
    try {
        console.log("installing snap");
        // enable filecoin snap with default testnet network
        const metamaskFilecoinSnap = await enableFilecoinSnap({network: "d"}, origin);
        isInstalled = true;
        console.log("Snap installed!!");
        return {isSnapInstalled: true, snap: metamaskFilecoinSnap};
    } catch (e) {
        console.log(e);
        isInstalled = false;
        return {isSnapInstalled: false};
    }
}

export async function isFilecoinSnapInstalled(): Promise<boolean> {
    return isInstalled;
}
