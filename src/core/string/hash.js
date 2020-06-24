export function hash(string) {
  return string.split('').reduce((a, b) => {
    return ((a << 5) - a + b.charCodeAt(0)) | 0
  }, 0)
}

export function objectToHash(object) {
  const string = JSON.stringify(object)
  return hash(string)
}
