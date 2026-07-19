// permissions: [{ resource: "teacher", action: "read" | "write" }, ...]

export function hasResource(permissions, resource) {
  return (permissions || []).some((p) => p.resource?.toLowerCase() === resource?.toLowerCase())
}

export function hasPermission(permissions, resource, action) {
  return (permissions || []).some((p) => p.resource?.toLowerCase() === resource?.toLowerCase() && p.action === action)
}
