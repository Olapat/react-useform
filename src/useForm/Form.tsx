import React, { createContext, useCallback } from 'react'
import type { UseFormType } from './useForm'
import type { UseListType } from '../useFormList/useList'
import middleware from '../utils/middleware'

export type FormContextType = UseFormType<any> & { isFieldDisable: Function, showStarRequired?: boolean } | null
export const FormContext = createContext<FormContextType>(null)

interface Props<ValuesType, ValuesListType> extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  handleSubmit: ((values: ValuesType & { [K: string]: ValuesListType[] }, next: Function, end: Function) => void) | ((values: any & { [K: string]: ValuesListType[] }, next: Function, end: Function) => void)[];
  /** @deprecated Please use handleSubmit instead. */ handlerSubmit?: ((values: ValuesType & { [K: string]: ValuesListType[] }, next: Function, end: Function) => void) | ((values: any & { [K: string]: ValuesListType[] }, next: Function, end: Function) => void)[];
  form: UseFormType<ValuesType>
  onSubmitError?: Function;
  preventEnter?: boolean;
  showStarRequired?: boolean;
  mode?: 'list'
  listCtl?: UseListType<ValuesListType>,
  listName?: string 
}

const Form = <ValuesType extends { [key: string]: any } = {}, ValuesListType extends { [key: string]: any } = {}>(props: Props<ValuesType, ValuesListType>) => {
  const { children, handlerSubmit, handleSubmit, onSubmitError, form, preventEnter = false, showStarRequired = true, mode, listCtl, listName, ...formProps } = props;
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
    const resultValid = validate(null, end, true)
    let errors = {}
    let isValid = false
    let _values = null
    if (typeof resultValid === 'boolean') {
    } else {
      isValid = resultValid[0]
      errors = resultValid[1]
      _values = resultValid[2]
    }
    if (mode === 'list' && listCtl) {
      const isValidList = listCtl.validateListItem()
      if (isValid && isValidList) {
        next(_values)
        return
      }
    } else if (mode !== 'list') {
      if (isValid) {
        next(_values)
        return
      } 
    }
    if (typeof onSubmitError === 'function') {
      onSubmitError(errors, _values, rules)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validate, onSubmitError, values, rules, listCtl, mode])

  const buildValues = useCallback((values: ValuesType, next: Function) => {
    if (mode === 'list' && listCtl) {
      next({...values, [listName || 'listValue']: listCtl.values.map(item => item.values) })
    } else {
      next(values)
    }
  }, [listCtl, mode, listName])

  const _handlerSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const handle = handleSubmit || handlerSubmit
    if (Array.isArray(handle)) { 
      middleware([onStartSubmit, buildValidate, buildValues, ...handle, onEndSubmit], { end: onEndSubmit })
    } else if (typeof handle === 'function') {
      middleware([onStartSubmit, buildValidate, buildValues, handle, onEndSubmit], { end: onEndSubmit })
    }
  }, [handlerSubmit, handleSubmit, buildValidate, onStartSubmit, onEndSubmit, buildValues])

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
