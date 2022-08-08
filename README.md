# [React UseForm](https://olapat.github.io/react-useform-doc/)

The react hook useform controller

## 📦 Install

```bash
npm i @olapat/react-useform
```
## Basic
```jsx
import React, { useCallback } from 'react'
import { useForm, Form } from '@olapat/react-useform'

const Basic = () => {
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
      repassword: ''
    },
    rules: {
      username: {
        required: true
      },
      password: {
        required: true,
        isAllowed: {
          func: (value) => /^(?=.*d)(?=.*([a-z]|[ก-๙]))(?=.*[A-Z])(?=.*[a-zA-Zก-๙]).{8,}/.test(value),
          msg: 'Password is not format'
        }
      },
      repassword: {
        required: true,
        isAllowed: {
          func: (value, values) => value === values.password,
          msg: 'Password is not match'
        }
      }
    }
  })

  const { values, handlerChange, errors } = form

  const handlerSubmit = useCallback((values) => {
    console.table(values);
  }, [])

  return (
    <Form form={form} handlerSubmit={handlerSubmit}>
      <fieldset>
        <legend>Username</legend>
        <input
          type='text'
          name='username'
          onChange={handlerChange}
          value={values.username}
        />
        <br />
        <span>{errors.username}</span>
      </fieldset>
      <fieldset>
        <legend>Password</legend>
        <input
          type='password'
          name='password'
          onChange={handlerChange}
          value={values.password}
        />
        <br />
        <span>{errors.password}</span>
      </fieldset>
      <fieldset>
        <legend>Confirm Password</legend>
        <input
          type='password'
          name='repassword'
          onChange={handlerChange}
          value={values.repassword}
        />
        <br />
        <span>{errors.repassword}</span>
      </fieldset>
      <button type='submit'>
        Submit
      </button>
    </Form>
  )
}
```

## License

Copyright (c) 2021-present Olapat. See [LICENSE](./LICENSE.md) for details.
