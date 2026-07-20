import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useResetPasswordMutation } from '../store/slice/api/authApiSlice'
import { resetPasswordSchema } from '../validation/authSchemas'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [resetPassword, { isLoading, error }] = useResetPasswordMutation()
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) })

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm text-center">
          <p className="text-sm text-slate-500">This link isn't valid — ask your administrator for a new one.</p>
          <Link to="/login" className="mt-4 inline-block text-sm font-medium text-indigo-600">
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  const onSubmit = async (data) => {
    try {
      await resetPassword({ token, password: data.password }).unwrap()
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch {
      // failure is already surfaced below via `error` from useResetPasswordMutation
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">
            M
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Set your password</h1>
          <p className="mt-1 text-sm text-slate-500">Choose a password to finish setting up your account</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {success ? (
            <p className="text-sm text-emerald-600">Password set. Redirecting you to login…</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                    errors.password
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />
                {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>}
              </div>

              {error && (
                <p className="text-sm text-rose-500">
                  {error.data?.message || 'Something went wrong. Please try again.'}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isLoading ? 'Saving…' : 'Set password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
