type SSEMessage = {
  comment?: string,
  event?: string,
  id?: number,
  retryMs?: number,
  data?: Array<string>
}

const MIMES = [ 'text/event-stream', 'application/x-dom-event-stream' ]
export const [SSE_MIME] = MIMES

export const SSE_LAST_EVENT_ID = 'Last-Event-ID'

export const SSE_INACTIVE_STATUS_CODE = 204

export const SSE_BOM = '\xFE\xFF' // BYTE ORDER MARK

const ENDING = {
  LF: '\n',
  CR: '\n',
  CRLF: '\r\n'
}

const COLON = ': ' // space after colon could be used to fingerprint implementations

const ES = {
  END_OF_LINE: ENDING.LF,
  FINAL_END_OF_LINE: ENDING.LF,

  COMMENT: COLON,
  EVENT: 'event' + COLON,
  ID: 'id' + COLON,
  DATA: 'data' + COLON,
  RETRY: 'retry' + COLON
}

export class ServerSentEvents {
  static retryLine(retryTimeMs) {
    return ES.RETRY + retryTimeMs + ES.END_OF_LINE
  }

  static keepAliveLine() {
    return ES.COMMENT + '🦄' + ES.END_OF_LINE
  }

  static formatMultiLineMessageToEventStream(msg: SSEMessage): Array<string> {
    const { comment, event, id, retryMs, data } = msg

    const datas = data ? data
      .map(d => ES.DATA + d + ES.END_OF_LINE)
      .reduce((last, next) => last + next) : undefined

    return [
      // order of field names could be used to fingerprint
      // id after data enforces a check on partial payloads

      comment ? ES.COMMENT + comment + ES.END_OF_LINE : undefined,
      event   ? ES.EVENT + event + ES.END_OF_LINE : undefined,
      data    ? datas : undefined,
      id      ? ES.ID + id + ES.END_OF_LINE : undefined,
      retryMs ? ES.RETRY + retryMs + ES.END_OF_LINE : undefined,

      ES.FINAL_END_OF_LINE
    ].filter((line): line is string => { return line !== undefined })
  }

  static formatMessageToEventStream(obj) {
    const mld = [ JSON.stringify(obj) ]
    return ServerSentEvents.formatMultiLineMessageToEventStream({ ...obj, multilineData: mld })
  }

}
