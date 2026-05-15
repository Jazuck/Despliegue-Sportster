import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { authService, setToken } from '../services/api'
import { isValidEmail, parseFieldErrorsFromApi } from '../utils/authFormErrors'

const emptyFieldErrors = () => ({ email: '', password: '' })

function validateLoginClient(form) {
  const err = emptyFieldErrors()
  const email = String(form.email || '').trim()
  const password = String(form.password || '')

  if (!email) err.email = 'El email es obligatorio.'
  else if (!isValidEmail(email)) err.email = 'Formato de email no válido.'

  if (!password) err.password = 'La contraseña es obligatoria.'
  else if (password.length < 6) err.password = 'La contraseña debe tener mínimo 6 caracteres.'

  return err
}

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState(emptyFieldErrors)
  const [formError, setFormError] = useState('')
  const [cargando, setCargando] = useState(false)

  const clearField = (key) => {
    setFieldErrors((prev) => ({ ...prev, [key]: '' }))
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const clientErr = validateLoginClient(form)
    if (clientErr.email || clientErr.password) {
      setFieldErrors(clientErr)
      setFormError('')
      return
    }

    setCargando(true)
    setFieldErrors(emptyFieldErrors())
    setFormError('')

    try {
      const token = await authService.login({
        email: String(form.email).trim(),
        password: form.password,
      })

      setToken(token)

      window.dispatchEvent(new Event('sportster-auth'))

      navigate('/')
    } catch (err) {
      const raw = err?.message || ''
      const { fields, general } = parseFieldErrorsFromApi(raw)
      const next = emptyFieldErrors()
      if (fields.email) next.email = fields.email
      if (fields.password) next.password = fields.password
      if (!next.email && !next.password && general) {
        if (general.includes('Credenciales') || general.includes('401')) {
          next.password = 'Email o contraseña incorrectos.'
        } else {
          setFormError(general)
        }
      }
      setFieldErrors(next)
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <Header />
      <main className="sports-section sports-section--center auth-main">
        <div className="auth-wrap">
          <div className="auth-card">
            <div className="auth-card__inner">
              <h1 className="auth-card__title">Iniciar sesión</h1>
              <p className="auth-card__subtitle">Accede con tu cuenta Sportster</p>

              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                <div className={`field${fieldErrors.email ? ' field--has-error' : ''}`}>
                  <label htmlFor="login-email">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value })
                      clearField('email')
                    }}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? 'login-email-err' : undefined}
                  />
                  {fieldErrors.email ? (
                    <p id="login-email-err" className="auth-field-error" role="alert">
                      {fieldErrors.email}
                    </p>
                  ) : null}
                </div>

                <div className={`field${fieldErrors.password ? ' field--has-error' : ''}`}>
                  <label htmlFor="login-password">Contraseña</label>
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Tu contraseña"
                    value={form.password}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value })
                      clearField('password')
                    }}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? 'login-password-err' : undefined}
                  />
                  {fieldErrors.password ? (
                    <p id="login-password-err" className="auth-field-error" role="alert">
                      {fieldErrors.password}
                    </p>
                  ) : null}
                </div>

                {formError ? (
                  <p className="auth-form-summary-error" role="alert">
                    {formError}
                  </p>
                ) : null}

                <button type="submit" className="btn btn-primary" disabled={cargando}>
                  {cargando ? 'Entrando…' : 'Entrar'}
                </button>
              </form>

              <p className="auth-alt">
                ¿No tienes cuenta?
                <br />
                <Link to="/register" className="auth-alt-link">
                  Regístrate aquí
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

export default Login
