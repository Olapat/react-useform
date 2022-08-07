import React, { createContext, useCallback } from 'react'
import type { UseFormType } from './useForm'
import useList from '../useFormList/useList'
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
  mode?: string
  listCtl?: typeof useList
}

const Form = <ValuesType extends { [key: string]: any } = {}>(props: Props<ValuesType>) => {
  const { children, handlerSubmit, onSubmitError, form, preventEnter = false, showStarRequired = true, mode, ...formProps } = props
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
    if (mode !== "list") {
      let errors = {}
      if (typeof resultValid === 'boolean') {
      } else {
        errors = resultValid[1]
      }
     
    } else {
      let errors = {}
      if (typeof resultValid === 'boolean') {
      } else {
        errors = resultValid[1]
      }
      const listIsValidA = []
      for (const keyList in listCtls) {
        if (Object.hasOwnProperty.call(listCtls, keyList)) {
          const listCtl = listCtls[keyList]
          const listIsValid = listCtl.validateListItem()
          listIsValidA.push(listIsValid)
        }
      }
      if (isValid && listIsValidA.every(item => item === true)) {
        next(values)
        return
      }
    }
    
    if (typeof onSubmitError === 'function') {
      onSubmitError(errors, values, rules)
    }
  }, [validate, onSubmitError, values, rules])

  const buildValidate = useCallback((next, end) => {
    const [isValid, errors] = validate()
    const listIsValidA = []
    for (const keyList in listCtls) {
      if (Object.hasOwnProperty.call(listCtls, keyList)) {
        const listCtl = listCtls[keyList]
        const listIsValid = listCtl.validateListItem()
        listIsValidA.push(listIsValid)
      }
    }
    if (isValid && listIsValidA.every(item => item === true)) {
      next(values)
      return
    }
    end()
    if (typeof onSubmitError === 'function') {
      onSubmitError(errors, values, rules)
    }
    return [isValid, errors]
  }, [validate, onSubmitError, values, rules, listCtls])

  const buildValues = useCallback((values, next) => {
    const newValues = Object.assign({}, values)
    for (const keyList in listCtls) {
      if (Object.hasOwnProperty.call(listCtls, keyList)) {
        const listCtl = listCtls[keyList]
        const valueList = listCtl.values.flatMap(item => item.map(ite => ite.values))
        newValues[keyList] = valueList
      }
    }

    next(newValues)
  }, [listCtls])

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
