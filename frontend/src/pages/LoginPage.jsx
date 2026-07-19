import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../store/slice/authSlice'
import { useLoginMutation } from '../store/slice/api/authApiSlice'
import { loginSchema } from '../validation/authSchemas'

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) })
  const [login, { isLoading, error }] = useLoginMutation()
  const [permissionError, setPermissionError] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    setPermissionError('')

    try {
      const response = await login(data).unwrap()

      if (!response.permissions?.length) {
        setPermissionError('No permission provided for this account. Contact your administrator.')
        return
      }

      localStorage.setItem('token', response.token)
      dispatch(
        setCredentials({
          user: response.email,
          role: response.role,
          permissions: response.permissions,
        }),
      )

      navigate(`/${response.permissions[0].resource.toLowerCase()}`)
    } catch {
      // failure is already surfaced below via `error` from useLoginMutation
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">
            M
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Welcome to ManTech</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to continue to your lectures</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                  errors.email
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                  errors.password
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>}
            </div>

            {(error || permissionError) && (
              <p className="text-sm text-rose-500">
                {permissionError || error.data?.message || 'Something went wrong. Please try again.'}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
