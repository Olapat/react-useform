/* eslint-disable indent */
import { useState, useCallback } from 'react'
import { checkErr } from './useCheckValidate'

export const getFieldName = (listKeys, name, _id) => `${listKeys}[${name || 'none'}]:${_id}`
export const getPureFieldName = (name) => /(?:\[)(.*?)(?=\s*\])/.exec(name)[1]

const useList = (form, listKeys) => {
  const {
    values,
    submitted,
    errors,
    setValues,
    setErrors,
    setRules,
    rules
  } = form

  const [count, setCount] = useState(() => {
    let res = {}
    for (const key of listKeys) {
      res = {
        ...res,
        [key]: values[key]?.length || 0
      }
    }

    return res
  })

  const addListItem = useCallback((listKey, init, initRules = {}) => {
    const _id = count[listKey]
    const initValues = {}
    let initValuesList = { _id }
    for (const name in init) {
      if (Object.hasOwnProperty.call(init, name)) {
        const value = init[name]
        const fieldName = getFieldName(listKey, name, _id)
        initValuesList = {
          ...initValuesList,
          [name]: {
            fieldName,
            value
          }
        }
        initValues[fieldName] = value
      }
    }

    const _initRules = {}
    for (const name in initRules) {
      if (Object.hasOwnProperty.call(initRules, name)) {
        const rule = initRules[name]
        _initRules[getFieldName(listKey, name, _id)] = rule
      }
    }

    setValues((prev) => ({
      ...prev,
      [listKey]: [...(prev[listKey] || []), initValuesList],
      ...initValues
    }))

    setRules((prev) => ({
      ...prev,
      ..._initRules
    }))
    setCount((prev) => ({
      ...prev,
      [listKey]: Number(prev[listKey]) + 1
    }))
  }, [setValues, count, setCount, setRules])

  const handlerChangeList = useCallback((_id, name, value, type = 'string') => {
    const listName = /^.+(?=\s*\[)/.exec(name)?.toString()
    const rule = rules[name]
    if (rules && Object.keys(errors).length && rule && submitted) {
      setErrors((prev) => ({
        ...prev,
        [name]: checkErr(rule, value, name)
      }))
    } else if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined
      }))
    }
    setValues((prev) => {
      const pureFieldName = getPureFieldName(name)
      const temp = prev[listName] || []
      const index = temp.findIndex((item) => item._id === _id)
      const tempData = temp[index] || {}

      let newValue = tempData[pureFieldName]?.value || ''
      switch (type) {
        case 'string': {
          newValue = value
          break
        }
        case 'number': {
          const notNumValue = /\D/.exec(value)
          if (!(notNumValue && notNumValue[0]) || value === '') {
            newValue = value
          }
          break
        }
        default:
          break
      }

      const newData = {
        ...tempData,
        [pureFieldName]: {
          ...(tempData[pureFieldName] || {}),
          value: newValue
        }
      }

      temp.splice(index, 1, newData)

      return {
        ...prev,
        [listName]: [...temp],
        [name]: newValue
      }
    })
  }, [setErrors, setValues, errors, rules, submitted])

  const removeListItem = useCallback((listKey, _id) => {
    const reg = new RegExp(`${listKey}.*:${_id}`)
    setValues((prev) => {
      const temp = prev
      const tempList = temp[listKey]
      const index = tempList.findIndex((item) => item._id === _id)
      tempList.splice(index, 1)
      for (const name in temp) {
        if (Object.hasOwnProperty.call(temp, name)) {
          if (reg.test(name)) delete temp[name]
        }
      }

      return {
        ...temp,
        [listKey]: [...tempList]
      }
    })

    setRules((prev) => {
      const temp = prev
      for (const name in temp) {
        if (Object.hasOwnProperty.call(temp, name)) {
          if (reg.test(name)) delete temp[name]
        }
      }
      return { ...temp }
    })

    setErrors((prev) => {
      const temp = prev
      for (const name in temp) {
        if (Object.hasOwnProperty.call(temp, name)) {
          if (reg.test(name)) delete temp[name]
        }
      }
      return { ...temp }
    })
  }, [setValues, setErrors, setRules])

  const setRulesList = useCallback((newRules, listKey, _id) => {
    setRules(prev => {
      let temp = prev
      for (const name in newRules) {
        if (Object.hasOwnProperty.call(newRules, name)) {
          const rule = newRules[name]
          const fieldName = getFieldName(listKey, name, _id)
          if (!rule) {
            temp[fieldName] = undefined
          } else {
            temp = {
              ...temp,
              [fieldName]: rule
            }
          }
        }
      }

      return { ...temp }
    })
  }, [setRules])

  return {
    ...form,
    addListItem,
    handlerChangeList,
    removeListItem,
    setCount,
    typeForm: 'list',
    listKeys,
    setRulesList
  }
}

export default useList
