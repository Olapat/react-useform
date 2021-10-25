import * as React from 'react'
import { actionTypes } from './actions'
import useCheckValidate, { checkErr } from './useCheckValidate'

type State = any
type Action = { type: string, key?: string, value?: any, payload?: any }

function reducerValues(state: State, action: Action) {
  switch (action.type) {
    case actionTypes.MAIN.CHANGE:
      return { ...state, [action.key || '']: action.value }
    case actionTypes.MAIN.SET:
      return { ...state, ...action.payload }
    case actionTypes.MAIN.RESET:
      return { ...action.payload }
    default:
      return state
  }
}

function reducerRules(state: State, action: Action) {
  switch (action.type) {
    case actionTypes.MAIN.CHANGE:
      return { ...state, [action.key || '']: action.value }
    case actionTypes.MAIN.SET:
      return { ...state, ...action.payload }
    case actionTypes.MAIN.RESET:
      return { ...action.payload }
    default:
      return state
  }
}

function reducerError(state: State, action: Action) {
  switch (action.type) {
    case actionTypes.MAIN.CHANGE:
      return { ...state, [action.key || '']: action.value }
    case actionTypes.MAIN.SET:
      return { ...state, ...action.payload }
    case actionTypes.MAIN.RESET:
      return { ...action.payload }
    default:
      return state
  }
}

export type Rules = {
  [unit: string]: {
    'required'?: string | boolean,
    'isAllowed'?: {
      func: (value: any, values: {}) => boolean,
      msg: React.ReactNode | string
    }
  },
}

export type Validate = boolean | [boolean, {}]

export type UseFormType = {
  initialValues: any
  values: any
  submitting: boolean,
  setSubmitting: Function,
  rules: Rules,
  errors: any,
  setValues: (prev: {}) => any,
  validate: (next: Function, end: Function, getErrorArray?: boolean, onSubmitError?: (errors: {}) => void) => Validate,
  setRules: (prev: Rules) => any,
  setErrors: (prev: {}) => any,
  handlerReset: (values: {}) => void,
  handlerChange: (name?: string | {}, value?: any, type?: 'string' | 'number') => void,
  blackList?: string | string[],
  whiteList?: string | string[],
  submitted: boolean
}

interface Props {
  initialValues: any,
  rules: Rules,
  blackList?: string | string[],
  whiteList?: string | string[],
  onValuesUpdate?: (values: {}) => void
}

const useForm = (props: Props): UseFormType => {
  const { initialValues, rules: initialRules, blackList, whiteList, onValuesUpdate } = props
  const [values, dispatchValues] = React.useReducer(reducerValues, initialValues)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [rules, dispatchRules] = React.useReducer(reducerRules, initialRules)
  const [errors, dispatchErrors] = React.useReducer(reducerError, {})
  const checkValidate = useCheckValidate()

  const setValues = React.useCallback((a1: any) => {
    if (typeof a1 === 'function') {
      const newValues = a1(values)
      dispatchValues({
        type: actionTypes.MAIN.SET,
        payload: newValues
      })
    } else {
      dispatchValues({
        type: actionTypes.MAIN.SET,
        payload: a1
      })
    }
  }, [values])

  const setRules = React.useCallback((a1: any) => {
    if (typeof a1 === 'function') {
      const newRules = a1(rules)
      dispatchRules({
        type: actionTypes.MAIN.SET,
        payload: newRules
      })
    } else {
      dispatchRules({
        type: actionTypes.MAIN.SET,
        payload: a1
      })
    }
  }, [rules])

  const setErrors = React.useCallback((a1: any) => {
    if (typeof a1 === 'function') {
      const newErrors = a1(errors)
      dispatchErrors({
        type: actionTypes.MAIN.SET,
        payload: newErrors
      })
    } else {
      dispatchErrors({
        type: actionTypes.MAIN.SET,
        payload: a1
      })
    }
  }, [errors])

  const validate = React.useCallback((next: Function, end: Function, getErrorArray?: boolean, onSubmitError?: (errors: {}) => void): Validate => {
    setSubmitted(true)
    let errors = {}
    if (rules) {
      errors = checkValidate(values, rules)
      dispatchErrors({
        type: actionTypes.MAIN.SET,
        payload: errors
      })
    }

    if (process.env.NODE_ENV === 'development') console.log('errors', errors)
    if (rules && Object.keys(errors).length) {
      setSubmitting(false)
      const firstId = Object.keys(errors)[0]
      const ele = document.getElementById(firstId)! as HTMLElement
      let returner: Validate = false
      if (ele) {
        const typeEle = ele.getAttribute('type')
        if (!!ele.focus && (typeEle !== 'checkbox' && typeEle !== 'radio') && typeEle !== null) {
          ele.focus()
        } else {
          ele.scrollIntoView({ block: 'center' })
        }
      }

      if (typeof end === 'function') end()

      if (getErrorArray === true) {
        returner = [false, errors]
      } else {
        returner = false
      }

      if (typeof onSubmitError === 'function') onSubmitError(errors)
      return returner
    }

    if (typeof next === 'function') next(values)

    if (getErrorArray === true) {
      return [true, errors]
    } else {
      return true
    }
  }, [rules, values, checkValidate])

  const handlerChange = React.useCallback((name: any, value?: any, type: 'string' | 'number' = 'string') => {
    if (typeof name === 'function') {
      const newValues = name(values)
      dispatchErrors({
        type: actionTypes.MAIN.SET,
        payload: errors
      })
      dispatchValues({
        type: actionTypes.MAIN.SET,
        payload: newValues
      })
      if (typeof onValuesUpdate === 'function') {
        onValuesUpdate({ ...values, ...newValues })
      }
    } else if (name?.target?.name && name?.target?.value) {
      const inputName = name?.target?.name
      const inputValue = name?.target?.value

      dispatchErrors({
        type: actionTypes.MAIN.CHANGE,
        key: inputName,
        value: checkErr(rules[inputName], inputValue, inputName, values)
      })

      dispatchValues({
        type: actionTypes.MAIN.CHANGE,
        key: inputName,
        value: inputValue
      })

      if (typeof onValuesUpdate === 'function') {
        onValuesUpdate({ ...values, [inputName]: inputValue })
      }
    } else if (typeof name === 'object') {
      const newValues = name
      if (submitted && rules) {
        const errors: {[unit: string]: any} = {}
        for (const name in newValues) {
          const value = newValues[name]
          errors[name] = checkErr(rules[name], value, name, values)
        }

        dispatchErrors({
          type: actionTypes.MAIN.SET,
          payload: errors
        })
      }

      dispatchValues({
        type: actionTypes.MAIN.SET,
        payload: newValues
      })

      if (typeof onValuesUpdate === 'function') {
        onValuesUpdate({ ...values, ...newValues })
      }
    } else {
      if (rules && Object.keys(errors).length && rules[name] && submitted) {
        dispatchErrors({
          type: actionTypes.MAIN.CHANGE,
          key: name,
          value: checkErr(rules[name], value, name, values)
        })
      } else if (errors[name]) {
        dispatchErrors({
          type: actionTypes.MAIN.CHANGE,
          key: name,
          value: undefined
        })
      }
      switch (type) {
        case 'string': {
          dispatchValues({
            type: actionTypes.MAIN.CHANGE,
            key: name,
            value: value
          })
          if (typeof onValuesUpdate === 'function') {
            onValuesUpdate({ ...values, [name]: value })
          }
          break
        }
        case 'number': {
          const notNumValue = /\D/.exec(value)
          if (!(notNumValue && notNumValue[0]) || value === '') {

            dispatchValues({
              type: actionTypes.MAIN.CHANGE,
              key: name,
              value: value
            })
          }
          if (typeof onValuesUpdate === 'function') {
            onValuesUpdate({ ...values, [name]: value })
          }
          break
        }
        default:
          break
      }
    }
  }, [errors, rules, submitted, values, onValuesUpdate])

  const handlerReset = React.useCallback((valuesReset: any = {}) => {
    dispatchValues({
      type: actionTypes.MAIN.RESET,
      payload: valuesReset
    })
    dispatchErrors({
      type: actionTypes.MAIN.RESET,
      payload: {}
    })
  }, [])

  return {
    initialValues,
    values,
    submitting,
    setSubmitting,
    rules,
    errors,
    setValues,
    validate,
    setRules,
    setErrors,
    handlerReset,
    handlerChange,
    blackList,
    whiteList,
    submitted
  }
}

export default useForm
