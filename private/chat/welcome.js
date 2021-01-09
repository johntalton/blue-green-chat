function sendFakeConversation() {
  const suffle = list => list
    .map(a => [Math.random(), a])
    .sort((a, b) => a[0] - b[0])
    .map(a => a[1])

  const personOne = [
    'Hows it going?',
    'Tell me about it',
    '😀', '😳'
  ]

  const personTwo = [
    'good, you?',
    'you should have seen the other guy!',
    '🤦🏻‍♂️', '🦄'
  ]
}
