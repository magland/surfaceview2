import GoogleSignInClient from "../../googleSignIn/GoogleSignInClient";
import { ObjectStorageClient } from "../../objectStorage/createObjectStorageClient";
import { PubsubChannel } from "../../pubsub/createPubsubClient";
import { elapsedSince, FeedId, isEqualTo, isFeedId, JSONObject, nowTimestamp, Timestamp, zeroTimestamp, _validateObject, pathifyHash, JSONValue, isNumber, isArrayOf, SignedSubfeedMessage } from "../../kacheryTypes";
import { isMessageCount, isSignedSubfeedMessage, isSubfeedHash, messageCount, MessageCount, messageCountToNumber, SubfeedHash, SubfeedMessage } from "../../kacheryTypes";

export class SubfeedView {
    #position: number
    #isAlive = true
    #handlingNewMessages = false
    constructor(public subfeed: Subfeed, private opts: {position: number, onNewMessages: ((subfeedMessages: SubfeedMessage[], messageNumber: number) => void)}) {
        this.#position = opts.position
        this._initialize()
    }
    public get position() {
        if (this.#position < 0) {
            if (this.subfeed.numMessages === undefined) return undefined
            return this.subfeed.numMessages + this.#position
        }
        return this.#position
    }
    cancel() {
        this.#isAlive = false
    }
    _initialize() {
        this._handleNewMessages()
        this.subfeed.onNewMessages(() => {
            this._handleNewMessages()  
        })
    }
    public get isAlive() {
        return this.#isAlive
    }
    async _handleNewMessages() {
        if (!this.#isAlive) return
        if (this.#handlingNewMessages) return
        this.#handlingNewMessages = true
        try {
            // handle negative starting position (to get last messages)
            if ((this.#position < 0) && (this.subfeed.numMessages !== undefined) && (this.subfeed.numMessages >= -this.#position)) {
                this.#position = this.#position + this.subfeed.numMessages
            }
            if ((this.subfeed.numMessages !== undefined) && (this.subfeed.numMessages > this.#position) && (this.#position >= 0)) {
                const newMessages: SubfeedMessage[] = []
                let i = this.#position
                while (i < this.subfeed.numMessages) {
                    const msg = await this.subfeed.getMessage(i)
                    if (!msg) throw Error(`Error getting message of ${this.subfeed.feedId} ${this.subfeed.subfeedHash} ${i}`)
                    newMessages.push(msg)
                    i ++
                }
                if (newMessages.length > 0) {
                    this.opts.onNewMessages(newMessages, this.#position)
                    this.#position = this.#position + newMessages.length
                }
            }
        }
        finally {
            this.#handlingNewMessages = false
        }
    }
}

// Only one subfeed object per subfeed
class Subfeed {
    #inMemoryMessages: {[key: number]: SubfeedMessage | null} = {}
    #numMessages: MessageCount | undefined = undefined
    #onNewMessagesCallbacks: (() => void)[] = []
    #lastSubscriptionTimestamp: Timestamp = zeroTimestamp()
    #isDownloadingMessages = false
    #consolidatedCount: number | undefined = undefined
    #triedLoadConsolidatedNames = new Set<String>()
    #downloadAllMessages: boolean = false
    #initialized = false
    #onInitializedCallbacks: (() => void)[] = []
    constructor(private opts: {feedId: FeedId, subfeedHash: SubfeedHash, objectStorageClient: ObjectStorageClient}) {
    }
    public get numMessages() {
        return this.#numMessages ? messageCountToNumber(this.#numMessages) : undefined
    }
    public get feedId() {
        return this.opts.feedId
    }
    public get subfeedHash() {
        return this.opts.subfeedHash
    }
    async initialize(downloadAllMessages: boolean) {
        if (this.#initialized) return
        this.#downloadAllMessages = downloadAllMessages
        await this._loadSubfeedJson()
        if (downloadAllMessages) {
            if ((this.#consolidatedCount !== undefined) && (this.#consolidatedCount > 0)) {
                await this._loadConsolidatedMessages()
            }
            this._startDownloadingMessages()
        }
        this.#initialized = true
        this.#onInitializedCallbacks.forEach(cb => {cb()})
    }
    async _waitForInitialized() {
        if (this.#initialized) return
        return new Promise<void>((resolve, reject) => {
            if (this.#initialized) {
                resolve()
                return
            }
            this.#onInitializedCallbacks.push(() => {
                resolve()
            })
        })
    }
    async getMessage(i: number) {
        await this._waitForInitialized()
        if (!(i in this.#inMemoryMessages) && (this.#consolidatedCount !== undefined) && (i < this.#consolidatedCount)) {
            await this._loadConsolidatedMessages()
        }
        if (!(i in this.#inMemoryMessages)) {
            const name = `feeds/${pathifyHash(this.opts.feedId)}/subfeeds/${pathifyHash(this.opts.subfeedHash)}/${i}`
            const data = await this.opts.objectStorageClient.getObjectData(name)
            if (!data) {
                this.#inMemoryMessages[i] = null
            }
            else {
                const msg = JSON.parse((new TextDecoder()).decode(data)) as any as JSONValue
                if (isSignedSubfeedMessage(msg)) {
                    this.#inMemoryMessages[i] = msg.body.message
                }
                else {
                    console.warn('Not a valid signed subfeed message', msg)
                    this.#inMemoryMessages[i] = null
                }
            }
        }
        return this.#inMemoryMessages[i] || null
    }
    async _loadConsolidatedMessages() {
        const consolidatedCount = this.#consolidatedCount
        if (!consolidatedCount) return
        const name = `feeds/${pathifyHash(this.opts.feedId)}/subfeeds/${pathifyHash(this.opts.subfeedHash)}/0-${consolidatedCount - 1}`
        if (this.#triedLoadConsolidatedNames.has(name)) return
        this.#triedLoadConsolidatedNames.add(name)
        const data = await this.opts.objectStorageClient.getObjectData(name)
        if (!data) return
        const x = JSON.parse((new TextDecoder()).decode(data)) as any as JSONValue
        if (isArrayOf(isSignedSubfeedMessage)(x)) {
            const msgs = x as any as SignedSubfeedMessage[]
            for (let i = 0; i < msgs.length; i++) {
                this.#inMemoryMessages[i] = msgs[i].body.message
            }
        }
        else {
            console.warn(`Not a valid array of signed subfeed messages: ${name}`)
        }
    }
    onNewMessages(callback: () => void) {
        this.#onNewMessagesCallbacks.push(callback)
    }
    public set lastSubscriptionTimestamp(t: Timestamp) {
        this.#lastSubscriptionTimestamp = t
    }
    public get lastSubscriptionTimestamp() {
        return this.#lastSubscriptionTimestamp
    }
    elapsedMsecSinceLastSubscription() {
        return elapsedSince(this.#lastSubscriptionTimestamp)
    }
    _setMessageCountInfo(messageCount: MessageCount) {
        if (messageCount !== this.#numMessages) {
            this.#numMessages = messageCount
            this.#onNewMessagesCallbacks.forEach(cb => {cb()})
            if (this.#downloadAllMessages) {
                this._startDownloadingMessages()
            }
        }
    }
    async _startDownloadingMessages() {
        if (this.#isDownloadingMessages) return
        this.#isDownloadingMessages = true
        try {
            let i = 0
            while ((this.#numMessages) && (i < messageCountToNumber(this.#numMessages))) {
                await this.getMessage(i)
                i ++
            }
        }
        finally {
            this.#isDownloadingMessages = false
        }
    }
    // _addMessages(messages: SignedSubfeedMessage[]) {
    //     if (messages.length === 0) return
    //     for (let msg of messages) {
    //         this.#inMemoryMessages.push(msg)
    //     }
    //     this.#onNewMessagesCallbacks.forEach(cb => {cb()})
    // }
    async _downloadSubfeedJson() {
        const name = `feeds/${pathifyHash(this.opts.feedId)}/subfeeds/${pathifyHash(this.opts.subfeedHash)}/subfeed.json`
        const data = await this.opts.objectStorageClient.getObjectData(name, {cacheBust: true})
        if (!data) return null
        const x = JSON.parse((new TextDecoder()).decode(data))
        return x as {messageCount: number, consolidatedCount: number | undefined}
    }
    async _loadSubfeedJson() {
        const x = await this._downloadSubfeedJson()
        if (!x) return
        const ct = x.messageCount
        if (x.consolidatedCount) {
            this.#consolidatedCount = x.consolidatedCount
        }
        if ((isNumber(ct)) && (ct > 0)) {
            if ((!this.#numMessages) || (ct > messageCountToNumber(this.#numMessages))) {
                this._setMessageCountInfo(messageCount(ct))
            }
        }
    }
}

type SubfeedUpdateMessage = {
    type: 'subfeedUpdate'
    feedId: FeedId
    subfeedHash: SubfeedHash
    messageCount: MessageCount // new total in the subfeed
}
const isSubfeedUpdateMessage = (x: any): x is SubfeedUpdateMessage => {
    return _validateObject(x, {
        type: isEqualTo('subfeedUpdate'),
        feedId: isFeedId,
        subfeedHash: isSubfeedHash,
        messageCount: isMessageCount
    })
}

class SubfeedManager {
    #subfeeds: {[key: string]: Subfeed} = {}
    constructor(private clientChannel: PubsubChannel, private objectStorageClient: ObjectStorageClient, private googleSignInClient: GoogleSignInClient | undefined) {

    }
    processServerMessage(msg: JSONObject) {
        if (isSubfeedUpdateMessage(msg)) {
            const codes =[this._subfeedCode(msg.feedId, msg.subfeedHash, true), this._subfeedCode(msg.feedId, msg.subfeedHash, false)]
            for (let code of codes) {
                if (code in this.#subfeeds) {
                    const sf = this.#subfeeds[code]
                    sf._setMessageCountInfo(msg.messageCount)
                }
            }
        }
    }
    subscribeToSubfeed(opts: {feedId: FeedId, subfeedHash: SubfeedHash, onMessages: (subfeedMessages: SubfeedMessage[], messageNumber: number) => void, downloadAllMessages: boolean, position: number}) {
        const code = this._subfeedCode(opts.feedId, opts.subfeedHash, opts.downloadAllMessages)
        let s = this.#subfeeds[code]
        if (!s) {
            s = new Subfeed({feedId: opts.feedId, subfeedHash: opts.subfeedHash, objectStorageClient: this.objectStorageClient})
            this.#subfeeds[code] = s
            s.initialize(opts.downloadAllMessages).then(() => {
                this.clientChannel.publish({
                    data: {
                        type: 'subscribeToSubfeed',
                        feedId: opts.feedId.toString(),
                        subfeedHash: opts.subfeedHash.toString()
                    }
                })
            })
        }
        s.lastSubscriptionTimestamp = nowTimestamp()
        const x = new SubfeedView(s, {position: opts.position, onNewMessages: opts.onMessages})
        return x
    }
    appendMessagesToSubfeed(opts: {feedId: FeedId, subfeedHash: SubfeedHash, messages: SubfeedMessage[]}) {
        const msg = {
            type: 'appendMessagesToSubfeed',
            feedId: opts.feedId.toString(),
            subfeedHash: opts.subfeedHash.toString(),
            messages: opts.messages
        }
        const msg2 = this.googleSignInClient ? {...msg, idToken: this.googleSignInClient.idToken} : msg
        this.clientChannel.publish({
            data: msg2
        })
    }
    _subfeedCode(feedId: FeedId, subfeedHash: SubfeedHash, downloadAllMessages: boolean) {
        return `${feedId}:${subfeedHash}:${downloadAllMessages ? "download" : ""}`
    }
}

export default SubfeedManager