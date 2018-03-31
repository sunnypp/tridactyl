// Sketch
//
// Need an easy way of getting and setting settings
// If a setting is not set, the default should probably be returned.
// That probably means that binds etc. should be per-key?
//
// We should probably store all settings in memory, and only load from storage on startup and when we set it
//
// Really, we'd like a way of just letting things use the variables
//

const CONFIGNAME = "userconfig"
const WAITERS = []
let INITIALISED = false

// make a naked object
function o(object){
    return Object.assign(Object.create(null),object)
}

// "Import" is a reserved word so this will have to do
function schlepp(settings){
    Object.assign(USERCONFIG,settings)
}

// TODO: have list of possibilities for settings, e.g. hintmode: reverse | normal
let USERCONFIG = o({})
const DEFAULTS = o({
    "configversion": "0.0",
    "nmaps": o({
        "o": "fillcmdline open",
        "O": "current_url open",
        "w": "fillcmdline winopen",
        "W": "current_url winopen",
        "t": "fillcmdline tabopen",
        "]]": "followpage next",
        "[[": "followpage prev",
        "[c": "urlincrement -1",
        "]c": "urlincrement 1",
        "T": "current_url tabopen",
        "yy": "clipboard yank",
        "ys": "clipboard yankshort",
        "yc": "clipboard yankcanon",
        "gh": "home",
        "gH": "home true",
        "p": "clipboard open",
        "P": "clipboard tabopen",
        "j": "scrollline 10",
        "k": "scrollline -10",
        "h": "scrollpx -50",
        "l": "scrollpx 50",
        "G": "scrollto 100",
        "gg": "scrollto 0",
        "$": "scrollto 100 x",
        // "0": "scrollto 0 x", // will get interpreted as a count
        "^": "buffer #",
        "H": "back",
        "L": "forward",
        "d": "tabclose",
        "u": "undo",
        "r": "reload",
        "R": "reloadhard",
        "gi": "focusinput -l",
        "gt": "tabnext_gt",
        "gT": "tabprev",
        "g^": "tabfirst",
        "g$": "tablast",
        "gr": "reader",
        "gu": "urlparent",
        "gU": "urlroot",
        ":": "fillcmdline",
        "s": "fillcmdline open search",
        "S": "fillcmdline tabopen search",
        // find mode not suitable for general consumption yet.
        // "/": "find",
        // "?": "find -1",
        // "n": "findnext 1",
        // "N": "findnext -1",
        "M": "gobble 1 quickmark",
        // "B": "fillcmdline bufferall",
        "b": "fillcmdline buffer",
        "ZZ": "qall",
        "f": "hint",
        "F": "hint -b",
        ";i": "hint -i",
        ";I": "hint -I",
        ";k": "hint -k",
        ";y": "hint -y",
        ";p": "hint -p",
        ";r": "hint -r",
        ";s": "hint -s",
        ";S": "hint -S",
        ";a": "hint -a",
        ";A": "hint -A",
        ";;": "hint -;",
        ";#": "hint -#",
        "I": "mode ignore",
        "a": "current_url bmark",
        "A": "bmark",
        "zi": "zoom 0.1 true",
        "zo": "zoom -0.1 true",
        "zz": "zoom 1",
        ".": "repeat",
    }),
    "autocmds": o({
        "DocStart": o({
            "addons.mozilla.org": "mode ignore"
        }),
    }),
    "exaliases": o({
        "alias": "command",
        "au": "autocmd",
        "b": "buffer",
        "o": "open",
        "w": "winopen",
        "t": "tabopen",
        "tn": "tabnext_gt",
        "bn": "tabnext_gt",
        "tnext": "tabnext_gt",
        "bnext": "tabnext_gt",
        "tp": "tabprev",
        "tN": "tabprev",
        "bp": "tabprev",
        "bN": "tabprev",
        "tprev": "tabprev",
        "bprev": "tabprev",
        "bfirst": "tabfirst",
        "blast": "tablast",
        "tfirst": "tabfirst",
        "tlast": "tablast",
        "bd": "tabclose",
        "bdelete": "tabclose",
    }),
    followpagepatterns: o({
        next: "^(next|newer)\\b|»|>>",
        prev: "^(prev(ious)?|older)\\b|«|<<",
    }),
    "searchengine": "google",
    "searchurls": o({
        "google":"https://www.google.com/search?q=",
        "scholar":"https://scholar.google.com/scholar?q=",
        "googleuk":"https://www.google.co.uk/search?q=",
        "bing":"https://www.bing.com/search?q=",
        "duckduckgo":"https://duckduckgo.com/?q=",
        "yahoo":"https://search.yahoo.com/search?p=",
        "twitter":"https://twitter.com/search?q=",
        "wikipedia":"https://en.wikipedia.org/wiki/Special:Search/",
        "youtube":"https://www.youtube.com/results?search_query=",
        "amazon":"https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=",
        "amazonuk":"https://www.amazon.co.uk/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=",
        "startpage":"https://startpage.com/do/search?language=english&cat=web&query=",
        "github":"https://github.com/search?utf8=✓&q=",
        "searx":"https://searx.me/?category_general=on&q=",
        "cnrtl":"http://www.cnrtl.fr/lexicographie/",
        "osm":"https://www.openstreetmap.org/search?query=",
        "mdn":"https://developer.mozilla.org/en-US/search?q=",
        "gentoo_wiki":"https://wiki.gentoo.org/index.php?title=Special%3ASearch&profile=default&fulltext=Search&search=",
        "qwant":"https://www.qwant.com/?q=",

    }),
    "newtab": "",
    "storageloc": "sync",
    "homepages": [],
    "hintchars": "hjklasdfgyuiopqwertnmzxcvb",
	"hintfiltermode": "simple",   // "simple", "vimperator", "vimperator-reflow"

    tabopenpos: 'next',
    relatedopenpos: 'related',
    "ttsvoice": "default",  // chosen from the listvoices list, or "default"
    "ttsvolume": 1,         // 0 to 1
    "ttsrate": 1,           // 0.1 to 10
    "ttspitch": 1,          // 0 to 2

    // either "nextinput" or "firefox"
    // If nextinput, <Tab> after gi brings selects the next input
    // If firefox, <Tab> selects the next selectable element, e.g. a link
    "gimode": "nextinput", // either "nextinput" or "firefox"

    "theme": "default",     // currently available: "default", "dark"

    // Default logging levels - 2 === WARNING
    "logging": o({
        "messaging": 2,
        "cmdline": 2,
        "controller": 2,
        "hinting": 2,
        "state": 2,
        "excmd": 1,
    }),
})

/** Given an object and a target, extract the target if it exists, else return undefined

    @param target path of properties as an array
*/
function getDeepProperty(obj, target) {
    if (obj !== undefined && target.length) {
        return getDeepProperty(obj[target[0]], target.slice(1))
    } else {
        return obj
    }
}

/** Create the key path target if it doesn't exist and set the final property to value.

    If the path is an empty array, replace the obj.

    @param target path of properties as an array
*/
function setDeepProperty(obj, value, target) {
    if (target.length > 1) {
        // If necessary antecedent objects don't exist, create them.
        if (obj[target[0]] === undefined) {
            obj[target[0]] = o({})
        }
        return setDeepProperty(obj[target[0]], value, target.slice(1))
    } else {
        obj[target[0]] = value
    }
}


/** Get the value of the key target.

    If the user has not specified a key, use the corresponding key from
    defaults, if one exists, else undefined.
*/
export function get(...target) {
    const user = getDeepProperty(USERCONFIG, target)
    const defult = getDeepProperty(DEFAULTS, target)

    // Merge results if there's a default value and it's not an Array or primitive.
    if (defult && (! Array.isArray(defult) && typeof defult === "object")) {
        return Object.assign(o({}), defult, user)
    } else {
        if (user !== undefined) {
            return user
        } else {
            return defult
        }
    }
}

/** Get the value of the key target, but wait for config to be loaded from the
    database first if it has not been at least once before.

    This is useful if you are a content script and you've just been loaded.
*/
export async function getAsync(...target) {
    if (INITIALISED) {
        return get(...target)
    } else {
        return new Promise((resolve) =>
            WAITERS.push(() => resolve(get(...target)))
        )
    }
}

/** Full target specification, then value

    e.g.
        set("nmaps", "o", "open")
        set("search", "default", "google")
        set("aucmd", "BufRead", "memrise.com", "open memrise.com")
*/
export function set(...args) {
    if (args.length < 2) {
        throw "You must provide at least two arguments!"
    }

    const target = args.slice(0, args.length - 1)
    const value = args[args.length - 1]

    setDeepProperty(USERCONFIG, value, target)
    save()
}

/** Delete the key at target if it exists */
export function unset(...target) {
    const parent = getDeepProperty(USERCONFIG, target.slice(0, -1))
    if (parent !== undefined) delete parent[target[target.length - 1]]
    save()
}

/** Save the config back to storage API.

    Config is not synchronised between different instances of this module until
    sometime after this happens.
*/
export async function save(storage: "local" | "sync" = get("storageloc")){
    // let storageobj = storage == "local" ? browser.storage.local : browser.storage.sync
    // storageobj.set({CONFIGNAME: USERCONFIG})
    let settingsobj = o({})
    settingsobj[CONFIGNAME] = USERCONFIG
    if (storage == "local") browser.storage.local.set(settingsobj)
    else browser.storage.sync.set(settingsobj)
}

/** Updates the config to the latest version.
    Proposed semantic for config versionning:
     - x.y -> x+1.0 : major architectural changes
     - x.y -> x.y+1 : renaming settings/changing their types
    There's no need for an updater if you're only adding a new setting/changing
    a default setting

    When adding updaters, don't forget to set("configversion", newversionnumber)!
*/
export async function update() {
    let updaters = {
        "0.0": async () => {
            try {
                // Before we had a config system, we had nmaps, and we put them in the
                // root namespace because we were young and bold.
                let legacy_nmaps = await browser.storage.sync.get("nmaps")
                if (legacy_nmaps) {
                    USERCONFIG["nmaps"] = Object.assign(legacy_nmaps["nmaps"], USERCONFIG["nmaps"])
                }
            } finally {
                set("configversion", "1.0")
            }
        },
        "1.0": () => {
            let vimiumgi = getDeepProperty(USERCONFIG, "vimium-gi")
            if (vimiumgi === true || vimiumgi === "true")
                set("gimode", "nextinput")
            else if (vimiumgi === false || vimiumgi === "false")
                set("gimode", "firefox")
            unset("vimium-gi")
            set("configversion", "1.1")
        }
    }
    if (!get("configversion"))
        set("configversion", "0.0")
    while (updaters[get("configversion")] instanceof Function) {
        await updaters[get("configversion")]()
    }
}

/** Read all user configuration from storage API then notify any waiting asynchronous calls

    asynchronous calls generated by getAsync.
*/
async function init() {
    let syncConfig = await browser.storage.sync.get(CONFIGNAME)
    schlepp(syncConfig[CONFIGNAME])
    // Local storage overrides sync
    let localConfig = await browser.storage.local.get(CONFIGNAME)
    schlepp(localConfig[CONFIGNAME])
    await update()
    INITIALISED = true
    for (let waiter of WAITERS) {
        waiter()
    }
}

// Listen for changes to the storage and update the USERCONFIG if appropriate.
// TODO: BUG! Sync and local storage are merged at startup, but not by this thing.
browser.storage.onChanged.addListener(
    (changes, areaname) => {
        if (CONFIGNAME in changes) {
            USERCONFIG = changes[CONFIGNAME].newValue
        }
    }
)

init()
