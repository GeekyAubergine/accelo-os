export function exhaust(
    _value: never,
    message = 'Failed exhaustive check',
  ): never {
    throw new Error(message)
  }
  