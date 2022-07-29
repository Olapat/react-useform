import React from 'react'
import { Form, useForm } from './components/form'

interface ValuesType {
  date: string,
  text: string
}

const App = () => {
  const form = useForm<ValuesType>({
    initialValues: {
      date: '',
      text: ''
    },
    rules: {
      date: {
        required: true,
        isAllowed: {
          func: (value) => value !== '2021-10-25',
          msg: 'Not Allowed'
        }
      },
      text: {
        required: true,
      }
    }
  })

  const onSubmit = React.useCallback((value) => {
    console.log('value', value)
  }, [])

  return (
    <main>
      <Form<ValuesType> form={form} handlerSubmit={onSubmit}>
        <fieldset>
          <legend>Date</legend>
          <input
            type='date'
            name='date'
            onChange={form.handlerChange}
            value={form.values.date}
          />
          <br />
          <span>{form.errors.date}</span>
        </fieldset>
        <fieldset>
          <legend>Text</legend>
          <input
            type='text'
            name='text'
            onChange={form.handlerChange}
            value={form.values.text}
          />
          <br />
          <span>{form.errors.text}</span>
        </fieldset>
        <button type='submit'>
          SUBMIT
        </button>
      </Form>
    </main>
  )
}

export default App
