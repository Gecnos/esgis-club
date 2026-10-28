import { useMocks } from '../../lib/env.ts'
import { callAdminUsers, demoStore } from './queries.ts'
import type { AccountValues } from './schemas.ts'
import type { Account } from './types.ts'

export async function createAccount(values: AccountValues): Promise<Account> {
  const payload = {
    email: values.email.trim().toLowerCase(),
    password: values.password,
    name: values.name.trim(),
    role: values.role,
    clubSlug: values.role === 'club' ? values.clubSlug : null,
  }
  if (useMocks) {
    if (demoStore.some((a) => a.email === payload.email)) throw new Error('Un compte existe déjà avec cet email')
    const account: Account = {
      id: `demo-${crypto.randomUUID()}`,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      clubSlug: payload.clubSlug,
      createdAt: new Date().toISOString(),
    }
    demoStore.push(account)
    return account
  }
  const { account } = await callAdminUsers<{ account: Account }>({ action: 'create', ...payload })
  return account
}

export async function resetAccountPassword(id: string, password: string): Promise<void> {
  if (useMocks) return
  await callAdminUsers({ action: 'password', id, password })
}

export async function deleteAccount(id: string): Promise<void> {
  if (useMocks) {
    const i = demoStore.findIndex((a) => a.id === id)
    if (i >= 0) demoStore.splice(i, 1)
    return
  }
  await callAdminUsers({ action: 'delete', id })
}
