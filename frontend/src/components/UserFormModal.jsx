import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSelector } from 'react-redux'
import Modal from './Modal'
import { useCreateUserMutation, useUpdateUserMutation } from '../store/slice/api/userApiSlice'
import { userCreateSchema, userEditSchema } from '../validation/userSchemas'

export default function UserFormModal({ open, onClose, onSubmit, user }) {
  const isEdit = Boolean(user)
  const roles = useSelector(state => state.rolePermission.roles)
  const [createUser, { isLoading: isCreating, error: createError }] = useCreateUserMutation()
  const [updateUser, { isLoading: isUpdating, error: updateError }] = useUpdateUserMutation()
  const isLoading = isCreating || isUpdating
  const error = createError || updateError

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(isEdit ? userEditSchema : userCreateSchema) })

  useEffect(() => {
    if (open) {
      reset({
        name: user?.name ?? '',
        email: user?.email ?? '',
        role: user?.roles?.[0]?.id != null ? String(user.roles[0].id) : '',
      })
    }
  }, [open, user, reset])

  const onFormSubmit = async (data) => {
    try {
      if (user?.id) {
        await updateUser({ ...data, id: user.id }).unwrap()
      } else {
        await createUser(data).unwrap()
      }
      onSubmit(data)
    } catch {
      // failure is already surfaced below via `error`
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit user' : 'Add a user'}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="user-name" className="mb-1.5 block text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            id="user-name"
            type="text"
            {...register('name')}
            placeholder="Priya Sharma"
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
              errors.name
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          />
          {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="user-email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          {isEdit ? (
            <p id="user-email" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
              {user.email}
            </p>
          ) : (
            <>
              <input
                id="user-email"
                type="email"
                {...register('email')}
                placeholder="name@school.edu"
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                  errors.email
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
              {!errors.email && (
                <p className="mt-1.5 text-xs text-slate-400">
                  They'll get a link to set a password and join with the selected role.
                </p>
              )}
            </>
          )}
        </div>

        <div>
          <label htmlFor="user-role" className="mb-1.5 block text-sm font-medium text-slate-700">
            Role
          </label>
          <select
            id="user-role"
            defaultValue=""
            {...register('role')}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 capitalize focus:outline-none focus:ring-1 ${
              errors.role
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          >
            <option value="" disabled>
              Select a role
            </option>
            {roles && roles.map((r) => (
              <option key={r.id} value={r.id} className="capitalize">
                {r.name}
              </option>
            ))}
          </select>
          {errors.role && <p className="mt-1 text-xs text-rose-500">{errors.role.message}</p>}
        </div>

        {error && (
          <p className="text-sm text-rose-500">
            {error.data?.message || 'Something went wrong. Please try again.'}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isLoading ? 'Saving…' : isEdit ? 'Save changes' : 'Add user'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
