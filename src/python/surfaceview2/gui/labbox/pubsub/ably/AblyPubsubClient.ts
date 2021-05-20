import Ably from 'ably'
import { PubsubMessage } from '../createPubsubClient'

class AblyPubsubChannel {
    #ablyChannel
    #messageBuffer: PubsubMessage[] = []
    #messageBufferSize: number = 0
    #sendMessageBufferScheduled = false
    constructor(private ablyClient: Ably.Realtime, private channelName: string, private opts: {}) {
        this.#ablyChannel = ablyClient.channels.get(channelName)
    }
    subscribe(callback: (message: PubsubMessage) => void) {
        this.#ablyChannel.subscribe((x: any) => {
            const data0 = JSON.parse(new TextDecoder().decode(x.data))
            if (data0.messages) {
                for (let msg0 of data0.messages) {
                    callback({
                        data: msg0
                    })
                }
            }
            else {
                // in the future we can remove this case
                callback({
                    data: data0
                })
            }
        })
    }
    publish(message: PubsubMessage) {
        this._queueMessage(message)
    }
    _queueMessage(message: PubsubMessage) {
        const messageSize = JSON.stringify(message).length
        const maxSize = 10000
        if ((this.#messageBufferSize > 0) && (this.#messageBufferSize + messageSize > maxSize)) {
            this._sendMessageBuffer()
        }
        this.#messageBuffer.push(message)
        this.#messageBufferSize += messageSize
        this._scheduleSendMessageBuffer()
    }
    _sendMessageBuffer() {
        this.#sendMessageBufferScheduled = false
        if (this.#messageBuffer.length === 0) return
        const messages = this.#messageBuffer
        this.#messageBuffer = []
        this.#messageBufferSize = 0
        this.#ablyChannel.publish({data: {messages: messages.map(m => (m.data))}})
    }
    _scheduleSendMessageBuffer() {
        if (this.#sendMessageBufferScheduled) return
        this.#sendMessageBufferScheduled = true
        const timeoutMsec = 150
        setTimeout(() => {
            this._sendMessageBuffer()
        }, timeoutMsec)
    }
}

export type AblyPubsubClientOpts = {
    token: string
}

class AblyPubsubClient {
    #ablyClient
    constructor(private opts: AblyPubsubClientOpts) {
        this.#ablyClient = new Ably.Realtime({token: opts.token});
    }
    getChannel(channelName: string) {
        return new AblyPubsubChannel(this.#ablyClient, channelName, {})
    }
}

export default AblyPubsubClient