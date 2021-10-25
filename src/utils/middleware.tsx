
const middleware = (arrayFunctions: Array<Function>, options?: { end?: Function }) => {
  function* generatorFunctions() {
    for (const func of arrayFunctions) {
      yield func
    }
  }

  const generator = generatorFunctions()
  try {
    const handlerNext = (...a: Array<any>) => {
      const funcNext = generator.next()
      if (typeof funcNext.value === 'function') {
        if (typeof options?.end === 'function') {
          funcNext.value(...a, handlerNext, options.end)
        } else {
          funcNext.value(...a, handlerNext)
        }
      } else if (funcNext.done) {
        generator.return()
      }
    }

    const gn = generator.next()
    if (typeof gn.value === 'function') {
      gn.value(handlerNext)
    }
  } catch (error) {
    generator.return()
  }
}

export default middleware
