import { hooks } from '@tarojs/shared'

import * as taroHooks from './framework-runtime/hooks'

hooks.tap('initNativeApi', (taro) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const hook in taroHooks) {
        taro[hook] = taroHooks[hook]
    }
});

export * from "@tarojs/runtime";
export * from "./framework-runtime";

export const container = {
    get: () => ({})
}

export const SERVICE_IDENTIFIER = {};
