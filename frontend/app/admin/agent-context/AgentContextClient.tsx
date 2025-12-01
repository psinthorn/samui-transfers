"use client"
import React, { useEffect, useMemo, useState } from "react"

type Ctx = {
  id: string
  key: string
  locale: string
  title?: string | null
  content: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export default function AgentContextClient() {
  const [items, setItems] = useState<Ctx[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Ctx | null>(null)
  const [filters, setFilters] = useState<{ key?: string; locale?: string; enabled?: string }>({})

  const emptyForm: Partial<Ctx> = useMemo(() => ({ key: "ai-agent-default", locale: "en", title: "", content: "", enabled: true }), [])
  const [form, setForm] = useState<Partial<Ctx>>(emptyForm)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.key) params.set("key", filters.key)
      if (filters.locale) params.set("locale", filters.locale)
      if (filters.enabled) params.set("enabled", filters.enabled)
      const url = "/api/admin/agent-context" + (params.toString() ? `?${params.toString()}` : "")
      const res = await fetch(url, { credentials: "include" })
      const ct = res.headers.get("content-type") || ""
      const data = ct.includes("application/json") ? await res.json() : { error: await res.text() }
      if (!res.ok) throw new Error(data?.error || "Failed to load")
      setItems(data.data || [])
    } catch (e: any) {
      const msg = String(e?.message || e)
      setError(msg.includes("<") ? "Not authorized or session expired. Please sign in again." : msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function onEdit(it: Ctx) {
    setEditing(it)
    setForm({ key: it.key, locale: it.locale, title: it.title || "", content: it.content, enabled: it.enabled })
  }
  function onDuplicate(it: Ctx) {
    setEditing(null)
    setForm({ key: it.key, locale: it.locale, title: (it.title || "") + " (copy)", content: it.content, enabled: it.enabled })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  function onCancel() {
    setEditing(null)
    setForm(emptyForm)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const method = editing ? "PUT" : "POST"
      const url = editing ? `/api/admin/agent-context?id=${editing.id}` : "/api/admin/agent-context"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      })
      const ct = res.headers.get("content-type") || ""
      const data = ct.includes("application/json") ? await res.json().catch(() => ({})) : { error: await res.text() }
      if (!res.ok) throw new Error(data?.error || "Failed to save")
      await load()
      onCancel()
    } catch (e: any) {
      const msg = String(e?.message || e)
      setError(msg.includes("<") ? "Not authorized or session expired. Please sign in again." : msg)
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this context?")) return
    setError(null)
    try {
      const res = await fetch(`/api/admin/agent-context?id=${id}`, { method: "DELETE", credentials: "include" })
      if (!res.ok && res.status !== 204) {
        const ct = res.headers.get("content-type") || ""
        const data = ct.includes("application/json") ? await res.json().catch(() => ({})) : { error: await res.text() }
        throw new Error(data?.error || "Failed to delete")
      }
      await load()
    } catch (e: any) {
      const msg = String(e?.message || e)
      setError(msg.includes("<") ? "Not authorized or session expired. Please sign in again." : msg)
    }
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-red-600">{error}</p>}

      <div className="card card-padding space-y-3">
        <h3 className="text-lg font-semibold">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm">Key</span>
            <input className="input" value={filters.key || ""} onChange={e => setFilters(f => ({ ...f, key: e.target.value }))} placeholder="ai-agent-assistant" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">Locale</span>
            <input className="input" value={filters.locale || ""} onChange={e => setFilters(f => ({ ...f, locale: e.target.value }))} placeholder="en" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">Enabled</span>
            <select className="input" value={filters.enabled || ""} onChange={e => setFilters(f => ({ ...f, enabled: e.target.value }))}>
              <option value="">Any</option>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button className="btn btn-primary" onClick={load}>Apply</button>
            <button className="btn" onClick={() => { setFilters({}); setTimeout(load, 0) }}>Reset</button>
          </div>
        </div>
      </div>
      <form onSubmit={onSubmit} className="card card-padding space-y-3">
        <h3 className="text-lg font-semibold">{editing ? "Edit Context" : "Create Context"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm">Key</span>
            <input className="input" value={form.key || ""} onChange={e => setForm(f => ({ ...f, key: e.target.value }))} placeholder="ai-agent-default" required />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">Locale</span>
            <input className="input" value={form.locale || ""} onChange={e => setForm(f => ({ ...f, locale: e.target.value }))} placeholder="en" required />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm">Title</span>
            <input className="input" value={form.title || ""} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Short label" />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!form.enabled} onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))} />
            <span>Enabled</span>
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Content</span>
          <textarea className="textarea min-h-[200px]" value={form.content || ""} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Paste your system prompt/context here" required />
        </label>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary">{editing ? "Save" : "Create"}</button>
          {editing && <button type="button" onClick={onCancel} className="btn">Cancel</button>}
        </div>
      </form>

      <div className="card card-padding">
        <h3 className="text-lg font-semibold mb-3">Existing Contexts</h3>
        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p>No contexts found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Locale</th>
                  <th>Title</th>
                  <th>Enabled</th>
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.id}>
                    <td className="font-mono text-xs">{it.key}</td>
                    <td>{it.locale}</td>
                    <td className="truncate max-w-[240px]">{it.title}</td>
                    <td>{it.enabled ? "Yes" : "No"}</td>
                    <td className="text-xs">{new Date(it.updatedAt).toLocaleString()}</td>
                    <td className="flex gap-2 justify-end">
                      <button className="btn btn-sm" onClick={() => onEdit(it)}>Edit</button>
                      <button className="btn btn-sm" onClick={() => onDuplicate(it)}>Duplicate</button>
                      <button className="btn btn-sm btn-danger" onClick={() => onDelete(it.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
