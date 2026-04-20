export interface AcknowledgeResponse {
    ok: boolean;
    error?: string;
}

export type AcknowledgeFn = (response: AcknowledgeResponse) => void;
