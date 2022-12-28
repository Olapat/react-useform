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
          onChange={(event) => handlerChange(event.target.name, event.target.value)}
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
          onChange={(event) => handlerChange(event.target.name, event.target.value)}
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
          onChange={(event) => handlerChange(event.target.name, event.target.value)}
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

## Props
### UseForm

| Props                    | Options                                                               | Required  | Description                                 |
| ------------------------ | --------------------------------------------------------------------- | --------  | ------------------------------------------- |
| initialValues            | Object: {[key: string]: any}                                          | true      | Set Initial Values Form                     |
| rules                    | Object: [Rules](#rules)                                               | true      | Set Initial Rules Form                      |
| blackList	               | String[]                                                              | false     | Field names is set to disabled              |
| whiteList	               | String[]	                                                             | false     | Field names is set to enabled               |
| onValuesUpdate           | Function                                                              | null      | Callback on values form updated            |

### Controller UseForm
| Props                    | Options                                                               | Description                      |
| ------------------------ | --------------------------------------------------------------------- | -------------------------------- |
| values                   | Object                                                                | Values form                      |
| handlerChange            | (string: name, value: any) => void                                    | Function to change values        |
| errors                   | Object                                                                | Errors form                      |
| setValues                | (newValues: Object) => void                                           | Function to set values form      |
| setRules                 | (newRules: Object) => void                                            | Function to set rules form       |
| setErrors                | (newErrors: Object) => void                                           | Function to set errors form      |
| handlerReset             | (newInitValues: Object) => void                                       | Function to reset values         |

### Rules
| Props                    | Options                                                               | Description                      |
| ------------------------ | --------------------------------------------------------------------- | -------------------------------- |
| required                 | boolean or string (Message on invalid)                                | Rule set field to required       |
| isAllowed                | Object: [IsAllowed](#isAllowed)                                       | Rule set field to allow value    |

### IsAllowed
| Props                    | Options                                                               | Description                      |
| ------------------------ | --------------------------------------------------------------------- | -------------------------------- |
| func                     | (value, values) => boolean                                            | Function is checking value       |
| msg                      | String                                                                | Message on value not allowed     |

## License

Copyright (c) 2021-present Olapat. See [LICENSE](./LICENSE.md) for details.
