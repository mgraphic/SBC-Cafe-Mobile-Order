import Transport from 'winston-transport';

export type SplunkHecOptions = {
    /** Base URL of the Splunk HTTP Event Collector, e.g. https://localhost:8088 */
    url: string;
    /** Splunk HEC token */
    token: string;
    /** Splunk index to write events to */
    index?: string;
    /** Value of the "source" field on each event */
    source?: string;
    /** Value of the "sourcetype" field on each event */
    sourcetype?: string;
    /** Max number of events to buffer before forcing a flush */
    maxBatchSize?: number;
    /** Max time (ms) an event can sit in the buffer before being flushed */
    flushIntervalMs?: number;
};

/**
 * A winston transport that forwards log events to a Splunk HTTP Event
 * Collector (HEC) endpoint. Events are buffered and sent in batches to
 * avoid one HTTP request per log line.
 */
export class SplunkHecTransport extends Transport {
    private readonly endpoint: string;
    private readonly token: string;
    private readonly index?: string;
    private readonly source?: string;
    private readonly sourcetype?: string;
    private readonly maxBatchSize: number;
    private readonly flushIntervalMs: number;
    private buffer: string[] = [];
    private timer: NodeJS.Timeout;

    constructor(options: SplunkHecOptions & Transport.TransportStreamOptions) {
        super(options);

        this.endpoint = `${options.url.replace(/\/+$/, '')}/services/collector/event`;
        this.token = options.token;
        this.index = options.index;
        this.source = options.source;
        this.sourcetype = options.sourcetype;
        this.maxBatchSize = options.maxBatchSize ?? 10;
        this.flushIntervalMs = options.flushIntervalMs ?? 2000;

        this.timer = setInterval(() => this.flush(), this.flushIntervalMs);
        this.timer.unref?.();
    }

    log(info: any, callback: () => void): void {
        setImmediate(() => this.emit('logged', info));

        const { message, level, timestamp, ...rest } = info;

        this.buffer.push(
            stringifyEvent({
                time: timestamp ? Date.parse(timestamp) / 1000 : undefined,
                index: this.index,
                source: this.source,
                sourcetype: this.sourcetype,
                event: { level, message, ...rest },
            }),
        );

        if (this.buffer.length >= this.maxBatchSize) {
            this.flush();
        }

        callback();
    }

    private flush(): void {
        if (this.buffer.length === 0) {
            return;
        }

        const events = this.buffer;
        this.buffer = [];

        fetch(this.endpoint, {
            method: 'POST',
            headers: {
                Authorization: `Splunk ${this.token}`,
                'Content-Type': 'application/json',
            },
            body: events.join(''),
        }).catch((error) => {
            // Avoid throwing from within the logger itself.
            console.error('Failed to forward logs to Splunk:', error);
        });
    }

    close(): void {
        clearInterval(this.timer);
        this.flush();
    }
}

function stringifyEvent(event: unknown): string {
    const seen = new WeakSet<object>();

    return JSON.stringify(event, (_key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[CIRCULAR]';
            }

            seen.add(value);
        }

        return value;
    });
}
