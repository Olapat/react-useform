import useForm, { Props, Rules } from '../useForm/useForm'
import useList, { Props as PropsUseList, ValuesList } from './useList'
import useCheckValidate from '../useForm/useCheckValidate'
import { useCallback } from 'react'

const useFormList = <ValuesType extends { [key: string]: any } = {}, ValuesListType extends { [key: string]: any } = {}>(config: Props<ValuesType>, configList: PropsUseList<ValuesListType>) => {
  const form = useForm<ValuesType>(config)
  const listCtl = useList<ValuesListType>(configList)
  const checkValidate = useCheckValidate<ValuesListType>()

  const onChange = useCallback((ix: any, name: String, value: any, rules?: Rules<ValuesListType>) => {
    const arrayList = listCtl.values.map((_,i) => i)
    const prevItem = listCtl.values[arrayList[ix]]
    const values = {
      ...prevItem.values,
      [name as string]: value
    }
    const _rules = rules || prevItem.rules
    const newItem: ValuesList<ValuesListType> = {
      ...prevItem,
      values,
      rules: _rules,
      errors: form.submitted ? checkValidate(values, _rules) : {}
    }
    listCtl.changeListItem(ix, newItem)
  }, [listCtl, form.submitted, checkValidate])

  return {
    ...form,
    listCtl: {
      ...listCtl,
      onChange
    }
  }
}

export default useFormList
