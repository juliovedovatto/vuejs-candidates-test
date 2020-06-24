export default function(text, length, message = '...', messageSeparator = ' ') {
  if (text.length <= length) {
    return text
  }

  const offset = message.length + messageSeparator.length
  const substring = text.substring(0, length - offset)

  return `${substring}${messageSeparator}${message}`
}
