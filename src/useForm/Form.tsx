import React, { createContext, useCallback } from 'react'
import type { UseFormType } from './useForm'
import middleware from '../utils/middleware'

export type FormContextType = UseFormType<any> & { isFieldDisable: Function, showStarRequired?: boolean }
export const FormContext = createContext<FormContextType | null>(null)

interface Props<ValuesType> extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  handlerSubmit: Function | Function[];
  form: UseFormType<ValuesType>;
  onSubmitError?: Function;
  preventEnter?: boolean;
  showStarRequired?: boolean;
}

const Form = <ValuesType extends { [key: string]: any } = {}>(props: Props<ValuesType>) => {
  const { children, handlerSubmit, onSubmitError, form, preventEnter = false, showStarRequired = true, ...formProps } = props
  const { setSubmitting, validate, values, blackList, whiteList, rules } = form

  const onStartSubmit = useCallback((next: Function) => {
    setSubmitting(true)
    if (typeof next === 'function') {
      next()
    }
  }, [setSubmitting])

  const onEndSubmit = useCallback(() => {
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
  }, [handlerSubmit, buildValidate, onStartSubmit, onEndSubmit])

  const isFieldDisable = useCallback((name: keyof ValuesType):boolean => {
    if (blackList === '*') {
      return true
    } else if (whiteList === '*') {
      return false
    } else if (blackList && blackList?.length) {
      return blackList.includes(String(name))
    } else if (whiteList && whiteList?.length) {
      return !whiteList.includes(String(name))
    } else {
      return false
    }
  }, [whiteList, blackList])

  return (
    <FormContext.Provider value={{ ...form, isFieldDisable, showStarRequired }}>
      <form noValidate onSubmit={_handlerSubmit} {...formProps} onKeyDown={(e) => { if (preventEnter && e.code === 'Enter') e.preventDefault() }}>
        {children}
      </form>
    </FormContext.Provider>
  )
}

export default Form
