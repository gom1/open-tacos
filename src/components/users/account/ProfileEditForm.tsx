import { ReactElement, useCallback, useState, useLayoutEffect } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'

import { getUserProfile, updateUserProfile } from '../../../js/auth/CurrentUserClient'
import TextField from '../../ui/TextField'
import { Button, ButtonVariant } from '../../ui/BaseButton'
import { IWritableUserMetadata } from '../../../js/types/User'
import { doesUsernameExist } from '../../../js/userApi/user'

const UserProfileSchema = Yup.object().shape({
  nick: Yup.string()
    .min(2, 'Minimum 2 characters')
    .max(50, 'Maximum 50 characters')
    .required('Minimum 2 characters'),
  name: Yup.string()
    .max(40, 'Maximum 40 characters.'),
  bio: Yup.string()
    .max(150, 'Maximum 150 characters')
    .test('less-than-3-lines', 'Maximum 2 lines', (text) => text != null && text.split(/\r\n|\r|\n/).length <= 2)
})

export default function ProfileEditForm (): ReactElement {
  const [profile, setProfile] = useState<IWritableUserMetadata>({
    name: '',
    nick: '',
    bio: ''
  })

  useLayoutEffect(() => {
    const asyncLoad = async (): Promise<void> => {
      const profile = await getUserProfile()
      if (profile != null) { setProfile(profile) }
    }
    void asyncLoad()
  }, [])

  const submitHandler = useCallback(async (newValues) => {
    await updateUserProfile(newValues)
  }, [])

  const checkUsernameHandler = useCallback(async (value: string|undefined) => {
    if (value == null) return undefined
    // only check if nick has changed from the original
    if (profile.nick !== value && await doesUsernameExist(value)) {
      return 'User name is already taken!'
    }
    return undefined
  }, [profile.nick])

  return (
    <div data-lpignore='true'>
      <Formik
        initialValues={profile}
        validationSchema={UserProfileSchema}
        onSubmit={submitHandler}
        enableReinitialize
      >{({ isValid, isSubmitting, dirty }) => (
        <Form>
          <TextField
            name='nick'
            label='Username'
            validate={checkUsernameHandler}
            validateImmediately
          />
          <TextField name='name' label='Name' />
          <TextField name='bio' label='Bio' multiline rows={3} spellcheck />
          <Button
            label='Save' type='submit' variant={ButtonVariant.SOLID_DEFAULT}
            disabled={!isValid || isSubmitting || !dirty}
          />
        </Form>)}

      </Formik>
    </div>
  )
}
