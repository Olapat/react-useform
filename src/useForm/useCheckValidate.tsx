import React, { Fragment, useCallback } from 'react'
import type { Rules } from './useForm'

export const getRequiredMsg = (label: string, local: 'th' | 'en' = 'th') => {
  const locals = {
    en: 'Please input ',
    th: 'โปรดระบุ '
  }

  return locals[local] + label
}

const useCheckValidate = () => {
  return useCallback((values: any, rules: Rules) => {
    const errors: {[unit: string]: any} = {}

    for (const field in rules) {
      if (Object.hasOwnProperty.call(rules, field)) {
        const fieldRules = rules[field]
        const errMsg = checkErr(fieldRules, values[field], field, values)
        if (errMsg) errors[field] = errMsg
      }
    }
    return errors
  }, [])
}

export const checkErr = (fieldRules: any, value: any, fieldName: string, values: any) => {
  let errMsg
  for (const rule in fieldRules) {
    const valueRule = fieldRules[rule]
    if (typeof valueRule === 'undefined') continue
    if (Object.hasOwnProperty.call(fieldRules, rule)) {
      switch (rule) {
      case 'required':
        if (!CheckEmpty(value)) errMsg = typeof valueRule === 'string' ? valueRule : `Please input ${fieldName}`
        break
      case 'isAllowed':
        if (Array.isArray(valueRule)) {
          for (const item of valueRule) {
            if (typeof item?.func === 'function' && !item.func(value, values)) {
              errMsg = item.msg || `Please input ${fieldName} to be correct`
              break
            }
          }
        } else {
          if (typeof valueRule?.func === 'function' && !valueRule.func(value, values)) errMsg = valueRule.msg || `Please input ${fieldName} to be correct`
        }
        break
      case 'isAllowedAll': {
        const errMsgs = []
        for (const item of valueRule) {
          if (typeof item?.func === 'function' && !item.func(value, values)) {
            errMsgs.push(item.msg)
          }
        }
        if (errMsgs.length) {
          errMsg = (
            <>
              {errMsgs.map((item, index) => (
                <Fragment key={index}>
                  {index !== 0 && <br />}
                  {item}
                </Fragment>
              ))}
            </>
          )
        } else {
          errMsg = undefined
        }

        break
      }
      default:
        break
      }

      if (errMsg) break
    }
  }
  return errMsg
}

const CheckEmpty = (value: any) => {
  if ((value || value === 0) && typeof value === 'number') {
    return true
  } else if (value && typeof value === 'string' && value.trim() !== '') {
    return true
  } else if (Array.isArray(value)) {
    if (value?.length) {
      return true
    } else {
      return false
    }
  } else if (value && typeof value !== 'string') {
    return true
  } else if (value) {
    return true
  } else {
    return false
  }
}

export default useCheckValidate
