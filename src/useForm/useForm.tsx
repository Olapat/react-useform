import * as React from 'react'
import { actionTypes } from './actions'
import useCheckValidate, { checkErr } from './useCheckValidate'

type Reducer<State, Action> =
  (state: State, action: Action) => State;

type Action = { type: string, key?: string, value?: any, payload?: any }

function reducerValues<ValuesType extends { [key: string]: any }>(state: ValuesType, action: Action) {
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

function reducerRules<RulesState>(state: RulesState, action: Action) {
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

function reducerError<ErrorState>(state: ErrorState, action: Action) {
  switch (action.type) {
    case actionTypes.MAIN.CHANGE:
      return { ...state, [action.key || '']: action.value }
    case actionTypes.MAIN.SET:
      return { ...state, ...action.payload }
    case actionTypes.MAIN.SET_NEW:
      return action.payload
    case actionTypes.MAIN.RESET:
      return { ...action.payload }
    default:
      return state
  }
}

export type Rules<ValuesType> = {
  [unit in keyof Partial<ValuesType>]: {
    'required'?: string | boolean;
    'isAllowed'?: {
      func: (value: any, values: ValuesType) => boolean;
      msg: React.ReactNode | string;
    };
  };
};

export type ErrorForm<ValuesType> = {
  [unit in keyof ValuesType | string]: string | React.ReactNode | undefined | null
} | { [K: string]: string | React.ReactNode | undefined | null }

export type ReactChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>

export type Argument1OnChange = Function | ReactChangeEvent

export type Validate = boolean | [boolean, {}]

export type UseFormType<ValuesType> = {
  initialValues: ValuesType
  values: ValuesType
  submitting: boolean,
  setSubmitting: Function,
  rules: Rules<ValuesType>,
  errors: ErrorForm<ValuesType>,
  setValues: (a1: ((prev: ValuesType) => Partial<ValuesType>) | Partial<ValuesType>) => void,
  validate: (next: Function, end: Function, getErrorArray?: boolean, onSubmitError?: (errors: {}) => void) => Validate,
  setRules: (prev: Rules<ValuesType | {}>) => any,
  setErrors: (a1: ((prev: ErrorForm<ValuesType>) => ErrorForm<ValuesType>) | keyof ValuesType) => void,
  handlerReset: (values: {}) => void,
  handlerChange: (name: Argument1OnChange | Partial<ValuesType> | keyof ValuesType, value?: any, type?: 'string' | 'number') => void,
  blackList?: string | string[],
  whiteList?: string | string[],
  submitted: boolean
}

interface Props<ValuesType> {
  initialValues: ValuesType,
  rules: Rules<ValuesType>,
  blackList?: string | string[],
  whiteList?: string | string[],
  onValuesUpdate?: (values: ValuesType) => void
}

const useForm = <ValuesType extends { [key: string]: any } = {}>(props: Props<ValuesType>): UseFormType<ValuesType> => {
  const { initialValues, rules: initialRules, blackList, whiteList, onValuesUpdate } = props
  const [values, dispatchValues] = React.useReducer<Reducer<ValuesType, Action>>(reducerValues, initialValues)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [rules, dispatchRules] = React.useReducer<Reducer<Rules<ValuesType>, Action>>(reducerRules, initialRules)
  const [errors, dispatchErrors] = React.useReducer<Reducer<ErrorForm<ValuesType>, Action>>(reducerError, {})
  const checkValidate = useCheckValidate<ValuesType>()

  const setValues = React.useCallback((a1: ((prev: ValuesType) => Partial<ValuesType>) | Partial<ValuesType>) => {
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

  const setErrors = React.useCallback((a1: ((err: ErrorForm<ValuesType>) => ErrorForm<ValuesType>) | keyof ValuesType) => {
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
        type: actionTypes.MAIN.SET_NEW,
        payload: errors
      })
    }

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

  const handlerChange = React.useCallback((a1: Argument1OnChange | Partial<ValuesType> | keyof ValuesType, value?: any, type: 'string' | 'number' = 'string') => {
    if (typeof a1 === 'function') {
      const newValues = a1(values)
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
    } else if (typeof a1 === 'object') {
      const event = a1 as ReactChangeEvent
      if (event?.target?.name && event?.target?.value) {
        const inputName = event?.target?.name
        const inputValue = event?.target?.value

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
      } else {
        const newValues = a1 as Partial<ValuesType>
        if (submitted && rules) {
          let errors: ErrorForm<ValuesType> = {}
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
      }
    } else {
      const name = (a1 as keyof ValuesType) as string
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
            onValuesUpdate({ ...values, [a1]: value })
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
