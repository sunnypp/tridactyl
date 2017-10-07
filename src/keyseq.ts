/** Key-sequence parser
 *
 *  Given an iterable of keys and a mapping of keys to objects, return:
 *  
 *   - parser(keyseq, map):
 *   	the mapped object and a count
 *   	OR a suffix of keys[] that, if more keys are pressed, could map to an object.
 *   - completions(keyseq, map):
 *   	an array of keysequences in map that keyseq is a valid prefix of.
 *
 *  No key sequence in map may be a prefix of another key sequence in map. This
 *  is a point of difference from Vim that removes any time-dependence in the
 *  parser.
 *
 */

interface MinimalKey {
    readonly altKey: boolean
    readonly ctrlKey: boolean
    readonly metaKey: boolean
    readonly shiftKey: boolean
    readonly key: string
}

/** Convert a vim-style map command to a keysequence

    Any sequence in angled brackets is assumed to be a valid .key value, unless
    prefixed by S-, C-, M-, or A- (in which case it is a modifier of another
    key) or it's entire value is <lt> (in which case it is a literal <).
    
    For Vim compatibility, CR is aliased to Enter.

    Compatibility breaks:

    Shift + key must use the correct capitalisation of key: <S-j> != J, <S-J> == J.

    In Vim <A-x> == <M-x> on most systems. Not so here: we can't detect
    platform, so just have to use what the browser gives us.

    Vim has a predefined list of special key sequences, we don't: there are too
    many (and they're non-standard).[1].

    In Vim, you're still allowed to use <lt>: <M-<> == <M-<lt>>. Here only the
    former will work.

    In Vim, < doesn't necessarily start a map. That's more difficult for us
    because we treat any bracketed string as a valid multicharacter .key value.
    Instead, if a < is followed by a > with no <'s inbetween (matches
    /<[^<]*>/u), it is treated as the start of a bracket expression; otherwise
    as a literal <.
    
    Restrictions:

    It is not possible to map to a keyevent that actually sends the key value
    CR or any multi-character sequence containing a space or >. It is unlikely
    that browsers will ever do either of those things.

    [1]: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values

*/
function mapstr_to_keyseq(mapstr: string): MinimalKey[] {

    /** expr is a string that contains a bracketexpr, possibly followed by other characters or is invalid. */
    function bracketexpr_to_key(be: string): [MinimalKey, string] {
        // Drop the first character, we know it's a <
        be = be.slice(1)

        // MinimalKey object to build
        let key = {} as any

        // Deal with modifiers
        const modifiers = new Map([
            ["A-", "altKey"],
            ["C-", "ctrlKey"],
            ["M-", "metaKey"],
            ["S-", "shiftKey"],
        ])
        let mod = modifiers.get(be.slice(1, 3)) 
        if (mod) {
            key[mod] = true
            // Remove modifier prefix
            be = be.slice(3)
            // Special processing for modifier + > (e.g. <C->>)
            if (be.slice(0,2) === '>>') {
                key.key = '>'
                return key
            }
        }

        // Extract the whole bracket expr
        let bracketed_bit = (/[^\s<]*>/u).exec(be)[0]
        if (bracketed_bit.length === 1) {
            // bracket expr empty
            // TODO: This error message doesn't put the modifier back on.
            throw `Bracket expr must contain something! "<${be}"`
        }
        if (!bracketed_bit) {
            // TODO: Any modifier is lost by this point. Need to re-order stuff.
            key.key = '<'
        } else {
            be = be.replace(bracketed_bit, "")
            key.key = bracketed_bit.slice(0, -1)
            return [key, be]
        }
    }

    // Consume one character at a time until you encounter a <, then 
    return undefined

}

// Test correct input
mapstr_to_keyseq('abcd')
mapstr_to_keyseq('<C-a><CR>')
mapstr_to_keyseq('b<M->>a')

// Bad input
mapstr_to_keyseq('<>')
mapstr_to_keyseq('<A->')
 

/* // Split a string into a number prefix and some following keys. */
/* function keys_split_count(keys: string[]){ */
/*     // Extracts the first number with capturing parentheses */
/*     const FIRST_NUM_REGEX = /^([0-9]+)/ */

/*     let keystr = keys.join("") */
/*     let regexCapture = FIRST_NUM_REGEX.exec(keystr) */
/*     let count = regexCapture ? regexCapture[0] : null */
/*     keystr = keystr.replace(FIRST_NUM_REGEX,"") */
/*     return [count, keystr] */
/* } */

/* // Given a valid keymap, resolve it to an ex_str */
/* function resolve_map(map) { */
/*     // TODO: This needs to become recursive to allow maps to be defined in terms of other maps. */
/*     return nmaps.get(map) */
/* } */

/* // Valid keystr to ex_str by splitting count, resolving keystr and appending count as final argument. */
/* // TODO: This is a naive way to deal with counts and won't work for ExCmds that don't expect a numeric answer. */
/* // TODO: Refactor to return a ExCmdPartial object? */
/* function get_ex_str(keys): string { */
/*     let [count, keystr] = keys_split_count(keys) */
/*     let ex_str = resolve_map(keystr) */
/*     if (ex_str){ */
/*         ex_str = count ? ex_str + " " + count : ex_str */
/*     } */
/*     return ex_str */
/* } */

/* // A list of maps that keys could potentially map to. */
/* function possible_maps(keys): string[] { */
/*     let [count, keystr] = keys_split_count(keys) */

/*     // Short circuit or search maps. */
/*     if (nmaps.has(keystr)) { */
/*         return [keystr,] */
/*     } else { */
/*         // Efficiency: this can be short-circuited. */
/*         return completions(keystr) */
/*     } */
/* } */

/* // A list of maps that start with the fragment. */
/* export function completions(fragment): string[] { */
/*     let posskeystrs = Array.from(nmaps.keys()) */
/*     return posskeystrs.filter((key)=>key.startsWith(fragment)) */
/* } */

/* export interface NormalResponse { */
/*     keys?: string[] */
/*     ex_str?: string */
/* } */

/* export function parser(keys): NormalResponse { */
/*     // If there aren't any possible matches, throw away keys until there are */
/*     while ((possible_maps(keys).length == 0) && (keys.length)) { */
/*         keys = keys.slice(1) */
/*     } */

/*     // If keys map to an ex_str, send it */
/*     let ex_str = get_ex_str(keys) */
/*     if (ex_str){ */
/*         return {ex_str} */
/*     } */
/*     // Otherwise, return the keys that might be used in a future command */
/*     return {keys} */
/* } */
