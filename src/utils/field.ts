import type { FormContextType } from '../useForm/Form'

export const getValues = (formContext: FormContextType, name: string, value: any) => {
  if (typeof value !== 'undefined') return value
  return formContext?.values?.[name] || ''
}

export const getRequired = (formContext: FormContextType, name: string, required?: string | boolean) => {
  if (typeof required !== 'undefined') return required
  if (formContext?.showStarRequired === false) return false
  return !!formContext?.rules?.[name]?.required
}

export const getError = (formContext: FormContextType, name: string, error: Function | string) => {
  if (typeof error === 'function') {
    return error(Object.freeze((formContext?.errors?.[name] || {})))
  }
  if (typeof error !== 'undefined') return error
  return formContext?.errors?.[name] || null
}

export const getDisabled = (formContext: FormContextType, name: string, disabled?: boolean) => {
  if (typeof disabled !== 'undefined') return disabled
  return formContext?.isFieldDisable?.(name) || false
}

export const getOnChange = (formContext: FormContextType, onChange?: Function) => {
  if (typeof onChange === 'function') return onChange
  return formContext?.handlerChange || (() => {})
}

export const getMessagePure = (fieldName: string, fieldNameTH: string, locale: string) => {
  if (locale === 'th') {
    return fieldNameTH
  }

  return fieldName
}

export const getMessageReq = (fieldName: string, fieldNameTH: string, locale: string) => {
  if (locale === 'th') {
    return 'กรุณาระบุ ' + fieldNameTH
  }

  return 'Please input ' + fieldName
}

