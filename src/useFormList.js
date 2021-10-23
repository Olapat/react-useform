import useForm from './useForm'
import useList, { getFieldName } from './useList'

const getConfig = (config, listFieldName) => {
  if (config.initialValues) {
    const _initialValuesList = {}
    let _initialRules = Object.assign({}, { ...config.rules })
    listFieldName.forEach((listKey) => {
      const list = config.initialValues[listKey]
      const rulesList = config.rules[listKey] || {}
      _initialValuesList[listKey] = list.map((valuesList, index) => {
        let initValuesList = {}
        const rules = rulesList[index]
        const _id = index
        for (const name in valuesList) {
          if (Object.hasOwnProperty.call(valuesList, name)) {
            const value = valuesList[name]
            const fieldName = getFieldName(listKey, name, _id)
            initValuesList = {
              ...initValuesList,
              _id,
              [name]: {
                fieldName,
                value
              }
            }
            _initialValuesList[fieldName] = value
          }
        }
        for (const name in rules) {
          if (Object.hasOwnProperty.call(rules, name)) {
            const value = rules[name]
            _initialRules = {
              ..._initialRules,
              [getFieldName(listKey, name, _id)]: value
            }
          }
        }
        return initValuesList
      })

      delete _initialRules[listKey]
    })

    return {
      ...config,
      initialValues: {
        ...config.initialValues,
        ..._initialValuesList
      },
      rules: _initialRules
    }
  }
}

const useFormList = (config, listFieldName) => {
  const form = useForm(getConfig(config, listFieldName))
  const formList = useList(form, listFieldName)
  return formList
}

export default useFormList
