const STATE = {
  SENDING: 'Sending',
  SEND_FAILURE: 'SendFailure',
  SENT: 'Sent'
}

export async function setupUI(esPort) {
  const ui = {
    containor: document.getElementById('containor'),
    chat: document.getElementById('chat'),
    message: document.getElementById('message'),
    send: document.getElementById('send'),
    form: document.getElementById('form')
  }

  ui.form.addEventListener('submit', async event => {
    event.preventDefault();
    const formData = new FormData(ui.form);
    const message = formData.get('message');

    await UI.sendMessage(ui, message)
  })

  esPort.onerror = e => console.log('es port error', e)
  esPort.onmessage = msg => UI.addMessageToUI(ui, msg)
  esPort.onopen = () => console.log('es port open')
  esPort.addEventListener('debug', msg => console.log('debug event', msg))

  ui.message.disabled = false
  ui.send.disabled = false
  ui.message.readOnly = false;
  ui.message.focus()
}

class UI {
  static async sendMessage(ui, message) {

    ui.containor.classList.add(STATE.SENDING)
    // ui.message.disabled = true
    // ui.send.disabled = true

    try {
      const result = await fetch('/services/message', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message })
      })

      if(result.status !== 200) { ui.containor.classList.add(STATE.SEND_FAILURE) }

    } catch (e) {
      ui.containor.classList.add(STATE.SEND_FAILURE)
    } finally {
      ui.containor.classList.remove(STATE.SENDING)
      ui.message.focus()
    }

    ui.containor.classList.remove(STATE.SEND_FAILURE)
    ui.containor.classList.add(STATE.SENT)
    setTimeout(() => ui.containor.classList.remove(STATE.SENT), 15 * 1000)

    ui.form.reset()
  }

  static addMessageToUI(ui, msg) {
    const msgData = JSON.parse(msg.data)
    console.log('addMessageToUI', msgData)

    if(msgData.message !== undefined) {
      const div = document.createElement('DIV') // TODO NS
      div.textContent = msgData.message
      ui.chat.prepend(div)
    }
    else {
      console.log('unhandled msgData', msg)
    }
  }

  static closeChat(chat, msssage, send) {
    console.log('closeChat')
  }
}
