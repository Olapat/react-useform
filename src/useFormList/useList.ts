import { useCallback, useEffect, useReducer } from 'react'
import useCheckValidate from '../useForm/useCheckValidate'
import type { Rules, ErrorForm } from '../useForm/useForm'

export type ValuesList<ValuesListType> = {
  values: ValuesListType,
  rules: Rules<ValuesListType>,
  errors: ErrorForm<ValuesListType>
}

type DispatchType = {
  type: string,
  payload: any
}

export interface Props<ValuesListType> {
  initialValues: ValuesList<ValuesListType>[]
}

export type UseListType<ValuesListType> = {
  values: ValuesList<ValuesListType>[],
  addListItem: (init: ValuesList<ValuesListType>) => void,
  changeListItem: (ix: number, value: ValuesList<ValuesListType>) => void,
  removeListItem: (ix: number) => void,
  validateListItem: () => boolean,
  addManyListItem: (num: number, init: ValuesListType) => void,
  setList: (arrayList: ValuesList<ValuesListType>[]) => void,
  setRulesItem: (ix: number, rules: Rules<ValuesListType>) => void
}

function reducerValues<ValuesListType>(state: ValuesList<ValuesListType>[], action: DispatchType) {
  switch (action.type) {
  case 'ADD': {
    const newState = [...state, action.payload]
    return newState
  }
  case 'ADD_MANY': {
    const newState = [...state, ...action.payload]
    return newState
  }
  case 'CHANGE': {
    const newState = [...state]
    newState.splice(action.payload.ix, 1, action.payload.value)
    return newState
  }
  case 'REMOVE': {
    const newState = [...state]
    newState.splice(action.payload.ix, 1)
    return newState
  }
  case 'SET':
    return action.payload
  case 'SET_RULES_ITEM': {
    const newState = [...state]
    const prevState = newState[action.payload.ix]
    const keys = Object.keys(action.payload.rules)
    const newErrors: {[unit in string]: undefined} = {}
    keys.forEach(key => {
      newErrors[key] = undefined
    });

    newState.splice(action.payload.ix, 1, { ...prevState, rules: { ...prevState.rules, ...action.payload.rules }, errors: { ...prevState.errors, ...newErrors } })
    return newState
  }
  case 'RESET':
    return []
  default:
    return state
  }
}

const useList = <ValuesListType extends { [key: string]: any } = {}>(props: Props<ValuesListType>): UseListType<ValuesListType> => {
  const { initialValues } = props

  const [values, dispatchValues] = useReducer<(state: ValuesList<ValuesListType>[], action: DispatchType) => ValuesList<ValuesListType>[]>(reducerValues, initialValues || [])
  const checkValidate = useCheckValidate()

  const addListItem = useCallback((init: ValuesList<ValuesListType>) => {
    dispatchValues({
      type: 'ADD',
      payload: init
    })
  }, [])

  const changeListItem = useCallback((ix: number, value: ValuesList<ValuesListType>) => {
    dispatchValues({
      type: 'CHANGE',
      payload: {
        ix, value
      }
    })
  }, [])

  const removeListItem = useCallback((ix: number) => {
    dispatchValues({
      type: 'REMOVE',
      payload: {
        ix
      }
    })
  }, [])

  const validateListItem = useCallback(() => {
    let isValid = true
    const valuesFlat = values.map(item => {
      const errors = checkValidate(item.values, item.rules)
      if (Object.keys(errors).length) {
        isValid = false
      }
      return {
        ...item,
        errors
      }
    })
    dispatchValues({
      type: 'SET',
      payload: valuesFlat
    })

    return isValid
  }, [values, checkValidate])

  const addManyListItem = useCallback((num: number, init: ValuesList<ValuesListType>['values']) => {
    const arrayNumber = []
    for (let index = 1; index <= Number(num); index++) {
      arrayNumber.push(init)
    }
    dispatchValues({
      type: 'ADD_MANY',
      payload: arrayNumber
    })
  }, [])

  const setList = useCallback((arrayList: ValuesList<ValuesListType>[]) => {
    dispatchValues({
      type: 'SET',
      payload: arrayList
    })
  }, [])

  const setRulesItem = useCallback((ix: number, rules: ValuesList<ValuesListType>['rules']) => {
    dispatchValues({
      type: 'SET_RULES_ITEM',
      payload: {
        ix,
        rules 
      }
    })
  }, [])

  return {
    values,
    addListItem,
    changeListItem,
    removeListItem,
    validateListItem,
    addManyListItem,
    setList,
    setRulesItem
  }
}

export default useList
