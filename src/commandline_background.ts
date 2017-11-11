import * as Messaging from './messaging'

/** CommandLine API for inclusion in background script

  Receives messages from commandline_frame
*/
export namespace onLine {

    export type onLineCallback = (exStr: string) => void

    const listeners = new Set<onLineCallback>()
    export function addListener(cb: onLineCallback) {
        listeners.add(cb)
        return () => { listeners.delete(cb) }
    }

    /** Receive events from commandline_frame and pass to listeners */
    function recvExStr(exstr: string) {
        for (let listener of listeners) {
            listener(exstr)
        }
    }

    /** Helpers for completions */
    async function currentWindowTabs() {
        return await browser.tabs.query({currentWindow:true})
    }

    // {{{ Example functions to demonstrate how to use messaging.ts
    // Press Ctrl Shift Alt I to view browser console and see logs for these messages when you press b
    function return5() {
        return 5
    }

    async function return5later() {
        return 5
    }

    function returnlater() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({response: "async response from background script"});
            }, 1000);
        })
    }
    // }}}

    Messaging.addListener("commandline_background", Messaging.attributeCaller({
        currentWindowTabs,
        recvExStr,
        return5,
        return5later,
        returnlater,
    }))
}
