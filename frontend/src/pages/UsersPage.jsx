import { useState } from 'react'
import UserFormModal from '../components/UserFormModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import { useGetAllUserQuery, useDeleteUserMutation } from '../store/slice/api/userApiSlice'
import { useGetAllRolesQuery } from '../store/slice/api/rolePermissionApiSlice'
import { useSelector } from 'react-redux'

export default function UsersPage() {
  useGetAllUserQuery()
  useGetAllRolesQuery()
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [deletingUser, setDeletingUser] = useState(null)
  const users = useSelector(state => state.user.users)

  const openAddModal = () => {
    setEditingUser(null)
    setModalOpen(true)
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setModalOpen(true)
  }

  const handleSubmit = () => {
    setModalOpen(false)
  }

  const handleDelete = (user) => {
    setDeletingUser(user)
  }

  const confirmDelete = async () => {
    try {
      await deleteUser(deletingUser.id).unwrap()
      setDeletingUser(null)
    } catch {
      // TODO: surface an error message if this ever fails
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
          <p className="mt-1 text-sm text-slate-500">Manage who has access and what role they have.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Add user
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users && users.map((user) => (
              <tr key={user.id}>
                <td className="px-5 py-3 font-medium text-slate-900">{user.name}</td>
                <td className="px-5 py-3 text-slate-500">{user.email}</td>
                <td className="px-5 py-3 text-slate-500">{user.roles?.map((r) => r.name).join(', ')}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${user.active
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                      : 'bg-slate-100 text-slate-600 ring-slate-500/20'
                      }`}
                  >
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => openEditModal(user)}
                    className="mr-3 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    className="text-sm font-medium text-rose-600 hover:text-rose-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {users && users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                  No users yet — add your first one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <UserFormModal
        key={editingUser?.id ?? 'new'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        user={editingUser}
      />

      <DeleteConfirmModal
        open={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete user"
        message={deletingUser ? `Are you sure you want to remove ${deletingUser.name}? This can't be undone.` : ''}
      />
    </div>
  )
}
