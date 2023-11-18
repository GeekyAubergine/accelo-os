export function exhaust(
    _value: never,
    message = 'Failed exhaustive check with',
  ): never {
    throw new Error(message)
  }
  