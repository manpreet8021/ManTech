// permissions: [{ resource: "user", action: "read" | "write" }, ...]
// Mirrors frontend/src/utils/permissions.js — keep the two in sync.

export function hasResource(permissions, resource) {
  return (permissions || []).some((p) => p.resource?.toLowerCase() === resource?.toLowerCase())
}

export function hasPermission(permissions, resource, action) {
  return (permissions || []).some((p) => p.resource?.toLowerCase() === resource?.toLowerCase() && p.action === action)
}
