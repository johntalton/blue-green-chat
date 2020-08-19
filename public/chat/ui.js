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
    form: document.getElementById('form'),
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const formData = new FormData(form);
    const message = formData.get('message');

    await UI.sendMessage(ui, message)
  })

  esPort.onclose = () => UI.closeChat(ui, msssage)
  esPort.onmessage = msg => UI.addMessageToUI(ui, msg)

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


    ui.containor.classList.remove(STATE.SENDING)
    ui.message.focus()

    if(result.status !== 200) {
      console.log('bad response - leave form alown and show send failure')
      ui.containor.classList.add(STATE.SEND_FAILURE)
    } else {
      ui.containor.classList.remove(STATE.SEND_FAILURE)
      ui.containor.classList.add(STATE.SENT)
      setTimeout(() => ui.containor.classList.remove(STATE.SENT), 15 * 1000)
      ui.form.reset()
    }
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
