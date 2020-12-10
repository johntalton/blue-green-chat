class PersonElement extends HTMLElement {
  connectedCallback() {
    console.log('connected', this)
    // Node.isConnected
  }

  adoptedCallback() {
    console.log('adopted', this)
  }

  disconnectedCallback() {
    console.log('disconnect', this)
  }

  // observedAttributes() { return [ '' ] }
  attributeChangedCallback() {
    console.log('attributeChanged', this)
  }
}

customElements.define('chat-person', PersonElement)
