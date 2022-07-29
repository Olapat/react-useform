import React, { createContext, useCallback } from 'react'
import type { UseFormType } from '../../useForm/useForm'
import middleware from '../../utils/middleware'

export const FormContext = createContext({})

interface Props<ValuesType> extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  handlerSubmit:| ((values: ValuesType, next: Function, end: Function) => any) | Function[];
  form: UseFormType<ValuesType>;
  onSubmitError?: Function;
}

const Form = <ValuesType extends { [key: string]: any } = {}>(props: Props<ValuesType>) => {
  const { children, handlerSubmit, onSubmitError, form, ...formProps } = props
  const { setSubmitting, validate, values, blackList, whiteList, rules } = form

  const onStartSubmit = React.useCallback((next: Function) => {
    setSubmitting(true)
    if (typeof next === 'function') {
      next()
    }
  }, [setSubmitting])

  const onEndSubmit = React.useCallback(() => {
    setSubmitting(false)
  }, [setSubmitting])

  const buildValidate = useCallback((next: Function, end: Function) => {
    const resultValid = validate(next, end, true)
    let errors = {}
    if (typeof resultValid === 'boolean') {
    } else {
      errors = resultValid[1]
    }
    if (typeof onSubmitError === 'function') {
      onSubmitError(errors, values, rules)
    }
  }, [validate, onSubmitError, values, rules])

  const _handlerSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (Array.isArray(handlerSubmit)) {
      middleware([onStartSubmit, buildValidate, ...handlerSubmit, onEndSubmit], { end: onEndSubmit })
    } else if (typeof handlerSubmit === 'function') {
      middleware([onStartSubmit, buildValidate, handlerSubmit, onEndSubmit], { end: onEndSubmit })
    }
  }, [handlerSubmit, buildValidate, onEndSubmit, onStartSubmit])

  const isFieldDisable = useCallback((name):boolean => {
    if (blackList === '*') {
      return true
    } else if (whiteList === '*') {
      return false
    } else if (blackList && blackList?.length) {
      return blackList.includes(name)
    } else if (whiteList && whiteList?.length) {
      return !whiteList.includes(name)
    } else {
      return false
    }
  }, [whiteList, blackList])

  return (
    <FormContext.Provider value={{ ...form, isFieldDisable }}>
      <form noValidate onSubmit={_handlerSubmit} {...formProps}>
        {children}
      </form>
    </FormContext.Provider>
  )
}

export default Form
