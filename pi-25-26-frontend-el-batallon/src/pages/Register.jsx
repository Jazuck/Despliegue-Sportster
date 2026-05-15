import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { authService, setToken } from '../services/api'
import {
  isValidEmail,
  isValidPhoneOptional,
  normalizePhoneDigits,
  parseFieldErrorsFromApi,
} from '../utils/authFormErrors'

const emptyFieldErrors = () => ({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

function validateRegisterClient(form) {
  const err = emptyFieldErrors()
  const name = String(form.name || '').trim()
  const email = String(form.email || '').trim()
  const password = String(form.password || '')
  const confirm = String(form.confirmPassword || '')

  if (!name) err.name = 'El nombre es obligatorio.'
  if (!email) err.email = 'El email es obligatorio.'
  else if (!isValidEmail(email)) err.email = 'Formato de email no válido.'

  if (!isValidPhoneOptional(form.phone)) {
    err.phone = 'Teléfono no válido: 9–15 dígitos, opcionalmente con + al inicio (sin espacios).'
  }

  if (!password) err.password = 'La contraseña es obligatoria.'
  else if (password.length < 6) err.password = 'Mínimo 6 caracteres.'

  if (!confirm) err.confirmPassword = 'Confirma la contraseña.'
  else if (confirm !== password) err.confirmPassword = 'Las contraseñas no coinciden.'

  return err
}

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState(emptyFieldErrors)
  const [formError, setFormError] = useState('')
  const [cargando, setCargando] = useState(false)

  const clearField = (key) => {
    setFieldErrors((prev) => ({ ...prev, [key]: '' }))
    setFormError('')
  }

  const fields = [
    {
      id: 'reg-name',
      label: 'Nombre o alias',
      key: 'name',
      type: 'text',
      auto: 'name',
      required: true,
      placeholder: 'Ej.: María o runner92',
    },
    {
      id: 'reg-email',
      label: 'Correo electrónico',
      key: 'email',
      type: 'email',
      auto: 'email',
      required: true,
      placeholder: 'tu@correo.com',
    },
    {
      id: 'reg-phone',
      label: 'Número de teléfono',
      key: 'phone',
      type: 'tel',
      auto: 'tel',
      required: false,
      placeholder: '612345678 (opcional)',
    },
    {
      id: 'reg-pass',
      label: 'Contraseña',
      key: 'password',
      type: 'password',
      auto: 'new-password',
      required: true,
      placeholder: 'Mínimo 6 caracteres',
    },
    {
      id: 'reg-pass2',
      label: 'Confirmar contraseña',
      key: 'confirmPassword',
      type: 'password',
      auto: 'new-password',
      required: true,
      placeholder: 'Repite la contraseña',
    },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    const clientErr = validateRegisterClient(form)
    if (Object.values(clientErr).some(Boolean)) {
      setFieldErrors(clientErr)
      setFormError('')
      return
    }

    setCargando(true)
    setFieldErrors(emptyFieldErrors())
    setFormError('')

    const phoneNorm = normalizePhoneDigits(form.phone)
    const payload = {
      name: String(form.name).trim(),
      email: String(form.email).trim(),
      phone: phoneNorm || null,
      password: form.password,
      confirmPassword: form.confirmPassword,
    }

    try {
      await authService.register(payload)
      try {
        const token = await authService.login({
          email: payload.email,
          password: payload.password,
        })
        setToken(token)
        window.dispatchEvent(new Event('sportster-auth'))
        navigate('/')
      } catch {
        setFormError(
          'Tu cuenta se ha creado, pero no se pudo iniciar sesión automáticamente. Entra desde «Iniciar sesión».',
        )
      }
    } catch (err) {
      const raw = err?.message || ''
      const { fields, general } = parseFieldErrorsFromApi(raw)
      const next = emptyFieldErrors()
      const keys = ['name', 'email', 'phone', 'password', 'confirmPassword']
      for (const k of keys) {
        if (fields[k]) next[k] = fields[k]
      }
      setFieldErrors(next)
      if (general && !keys.some((k) => fields[k])) {
        setFormError(general)
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <Header />
      <main className="sports-section sports-section--center auth-main">
        <div className="auth-wrap auth-wrap--wide">
          <div className="auth-card">
            <div className="auth-card__inner">
              <h1 className="auth-card__title">Crear cuenta</h1>
              <p className="auth-card__subtitle">Únete a Sportster y registra tus marcas</p>

              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                {fields.map(({ id, label, key, type, auto, required, placeholder }) => (
                  <div key={key} className={`field${fieldErrors[key] ? ' field--has-error' : ''}`}>
                    <label htmlFor={id}>{label}</label>
                    <input
                      id={id}
                      type={type}
                      autoComplete={auto}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) => {
                        setForm({ ...form, [key]: e.target.value })
                        clearField(key)
                      }}
                      required={required}
                      aria-invalid={Boolean(fieldErrors[key])}
                      aria-describedby={fieldErrors[key] ? `${id}-err` : undefined}
                    />
                    {fieldErrors[key] ? (
                      <p id={`${id}-err`} className="auth-field-error" role="alert">
                        {fieldErrors[key]}
                      </p>
                    ) : null}
                  </div>
                ))}

                {formError ? (
                  <p className="auth-form-summary-error" role="alert">
                    {formError}
                  </p>
                ) : null}

                <button type="submit" className="btn btn-primary" disabled={cargando}>
                  {cargando ? 'Registrando…' : 'Registrarme'}
                </button>
              </form>

              <p className="auth-alt">
                ¿Ya tienes cuenta?
                <br />
                <Link to="/login" className="auth-alt-link">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <footer className="footer">
        <p>&copy; 2026 Sportster. Todos los derechos reservados.</p>
      </footer>
    </>
  )
}

export default Register
