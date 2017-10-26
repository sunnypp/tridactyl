import {enumerate} from './itertools'

interface CompletionOption {
    focus: ()=>void
    value: string
}

abstract class CompletionSource {
    private obsolete = false
    public options = new Array<CompletionOption>()
    public node: HTMLElement

    // Called by updateCompletions on the child that succeeds its parent
    abstract makeActive()
        // this.node now belongs to you, update it or something :)
        // Example:
        // Mutate node or call replaceChild on its parent

    abstract async filter(exstr): Promise<CompletionSource>
        // <Do some async work that doesn't mutate any non-local vars>
        // Make a new CompletionOptions and return it
}


class BufferCompletionSource extends CompletionSource {

    private bufferSpecificShit = 3

    constructor(public node: HTMLElement) {
        // TODO
        super()
    }

    async makeActive() {
        // TODO
        return undefined
    }

    async filter(exstr) {
        // TODO
        return undefined
    }
}


async function commitIfCurrent(epochref, asyncFunc, commitFunc, args) {
    // I *think* sync stuff in here is guaranteed to happen immediately after
    // being called, up to the first await, despite this being an async
    // function. But I don't know. Should check.
    const epoch = epochref
    let res = await asyncFunc(...args)
    if (epoch === epochref) {
        return commitFunc(res)
    } else {
        throw "Did not commit: epoch out of date!"
    }
}

function updateCompletions(filter: string, sources: CompletionSource[]) {
    for (let [index, source] of enumerate(sources)) {
        // Tell each compOpt to filter, and if they finish fast enough they:
        //      0. Leave a note for any siblings that they got here first
        //      1. Take over their parent's slot in compOpts
        //      2. Update their display
        commitIfCurrent(
            source.obsolete,                   // Flag/epoch
            source.filter,                     // asyncFunc
            (childSource)=>{                   // commitFunc
                source.obsolete = true
                sources[index] = childSource
                childSource.makeActive()
            },
            filter                              // argument to asyncFunc
        )
    }
}
