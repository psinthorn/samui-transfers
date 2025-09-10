import { CardWrapper } from '@/components/auth/cardWrapper'
import { RegisterForm } from '@/components/auth/RegisterForm'


const RegisterPage = () => {
  return (
    <CardWrapper
      children={<RegisterForm />}
      headerLabel="Create an account"
      backButtonLabel="Already have an account? Login"
      backButtonOnHref="/auth/login"
      showSocial={true}
    />
  )
}

export default RegisterPage