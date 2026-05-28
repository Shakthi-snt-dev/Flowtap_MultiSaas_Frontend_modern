import React, { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, Plus, Edit2, Trash2, Mail, MessageSquare, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppSelector } from '@flowtap/store'
import { foodApi, inventoryApi, type StockAlertRule } from '@flowtap/api-core'
import { Button, Modal, Table, Spinner, Select, Input } from '@flowtap/ui-core'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Warehouse { id: string; name: string; code: string }
interface Product   { id: string; name: string; sku: string }

interface RuleForm {
  productId:        string
  warehouseId:      string
  threshold:        string
  unit:             string
  sendEmail:        boolean
  sendSms:          boolean
  sendWhatsApp:     boolean
  recipientContact: string
}

const EMPTY_FORM: RuleForm = {
  productId:        '',
  warehouseId:      '',
  threshold:        '',
  unit:             'kg',
  sendEmail:        true,
  sendSms:          false,
  sendWhatsApp:     false,
  recipientContact: '',
}

const UNITS = ['kg', 'g', 'litres', 'ml', 'pieces', 'packets', 'boxes', 'dozen']

// ─── Component ────────────────────────────────────────────────────────────────

export const FoodStockAlertPage: React.FC = () => {
  const tenant = useAppSelector((s) => s.tenant.tenant)

  const [rules, setRules]               = useState<StockAlertRule[]>([])
  const [loading, setLoading]           = useState(false)
  const [warehouses, setWarehouses]     = useState<Warehouse[]>([])
  const [products, setProducts]         = useState<Product[]>([])
  const [modalOpen, setModalOpen]       = useState(false)
  const [editing, setEditing]           = useState<StockAlertRule | null>(null)
  const [form, setForm]                 = useState<RuleForm>(EMPTY_FORM)
  const [saving, setSaving]             = useState(false)
  const [deletingId, setDeletingId]     = useState<string | null>(null)

  const loadRules = useCallback(() => {
    setLoading(true)
    foodApi.getStockAlerts()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? []
        setRules(Array.isArray(data) ? data : [])
      })
      .catch(() => toast.error('Failed to load stock alert rules'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadRules()
  }, [loadRules])

  useEffect(() => {
    if (!tenant?.id) return
    inventoryApi.getWarehouses({ companyId: tenant.id }).then((res) => {
      const data = res.data?.data ?? res.data
      setWarehouses(Array.isArray(data) ? data : [])
    })
    // Food POS: only FinalProduct (menu items made from raw materials)
    inventoryApi.getProducts({ companyId: tenant.id, pageSize: 500, kind: 'RawMaterial' }).then((res) => {
      const data = res.data?.data ?? res.data
      setProducts(data?.items ?? data ?? [])
    })
  }, [tenant?.id])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (rule: StockAlertRule) => {
    setEditing(rule)
    setForm({
      productId:        rule.productId,
      warehouseId:      rule.warehouseId,
      threshold:        String(rule.threshold),
      unit:             rule.unit,
      sendEmail:        rule.sendEmail,
      sendSms:          rule.sendSms,
      sendWhatsApp:     rule.sendWhatsApp,
      recipientContact: rule.recipientContact ?? '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.productId || !form.warehouseId) {
      toast.error('Product and warehouse are required')
      return
    }
    if (!form.threshold || parseFloat(form.threshold) <= 0) {
      toast.error('Threshold must be greater than 0')
      return
    }
    if (!form.sendEmail && !form.sendSms && !form.sendWhatsApp) {
      toast.error('Select at least one notification channel')
      return
    }
    if (!form.recipientContact) {
      toast.error('Recipient contact (email/phone) is required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        productId:        form.productId,
        warehouseId:      form.warehouseId,
        threshold:        parseFloat(form.threshold),
        unit:             form.unit,
        sendEmail:        form.sendEmail,
        sendSms:          form.sendSms,
        sendWhatsApp:     form.sendWhatsApp,
        recipientContact: form.recipientContact || undefined,
      }
      if (editing) {
        await foodApi.updateStockAlert(editing.id, payload)
        toast.success('Alert rule updated')
      } else {
        await foodApi.createStockAlert(payload)
        toast.success('Alert rule created')
      }
      setModalOpen(false)
      loadRules()
    } catch {
      toast.error('Failed to save alert rule')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this stock alert rule?')) return
    setDeletingId(id)
    try {
      await foodApi.deleteStockAlert(id)
      toast.success('Rule deleted')
      setRules((prev) => prev.filter((r) => r.id !== id))
    } catch {
      toast.error('Failed to delete rule')
    } finally {
      setDeletingId(null)
    }
  }

  // ─── Channel icons helper ──────────────────────────────────────────────────
  const ChannelBadges: React.FC<{ rule: StockAlertRule }> = ({ rule }) => (
    <div className="flex gap-1.5">
      {rule.sendEmail    && <span title="Email"    className="p-1 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"><Mail          className="w-3.5 h-3.5" /></span>}
      {rule.sendSms      && <span title="SMS"      className="p-1 rounded bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"><Phone       className="w-3.5 h-3.5" /></span>}
      {rule.sendWhatsApp && <span title="WhatsApp" className="p-1 rounded bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"><MessageSquare className="w-3.5 h-3.5" /></span>}
    </div>
  )

  const warehouseOptions = warehouses.map((w) => ({ value: w.id, label: `${w.name} (${w.code})` }))
  const productOptions   = products.map((p)   => ({ value: p.id, label: `${p.name} — ${p.sku}` }))
  const unitOptions      = UNITS.map((u)       => ({ value: u, label: u }))

  const productName  = (id: string) => products.find((p)  => p.id  === id)?.name  ?? id
  const warehouseName = (id: string) => warehouses.find((w) => w.id === id)?.name ?? id

  const columns = [
    {
      key: 'productId',
      header: 'Raw Material',
      render: (row: StockAlertRule) => (
        <span className="font-medium text-gray-800 dark:text-gray-200">{productName(row.productId)}</span>
      ),
    },
    {
      key: 'warehouseId',
      header: 'Kitchen Store',
      render: (row: StockAlertRule) => warehouseName(row.warehouseId),
    },
    {
      key: 'threshold',
      header: 'Alert Below',
      render: (row: StockAlertRule) => (
        <span className="font-semibold text-orange-600 dark:text-orange-400">
          {row.threshold} {row.unit}
        </span>
      ),
    },
    {
      key: 'channels',
      header: 'Notify Via',
      render: (row: StockAlertRule) => <ChannelBadges rule={row} />,
    },
    {
      key: 'recipientContact',
      header: 'Recipient',
      render: (row: StockAlertRule) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">{row.recipientContact ?? '—'}</span>
      ),
    },
    {
      key: 'lastTriggeredAt',
      header: 'Last Triggered',
      render: (row: StockAlertRule) =>
        row.lastTriggeredAt
          ? <span className="text-xs text-red-500">{new Date(row.lastTriggeredAt).toLocaleString()}</span>
          : <span className="text-xs text-gray-400">Never</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (row: StockAlertRule) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" icon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => openEdit(row)} />
          <Button
            variant="ghost" size="sm"
            icon={deletingId === row.id
              ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              : <Trash2 className="w-3.5 h-3.5 text-red-500" />
            }
            disabled={!!deletingId}
            onClick={() => handleDelete(row.id)}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kitchen Stock Alerts</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Get notified when raw materials fall below threshold — before service begins
            </p>
          </div>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Add Alert Rule</Button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-sm text-amber-800 dark:text-amber-300">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-semibold">How it works:</span> The system checks kitchen stock every 30 minutes.
          When a raw material quantity drops below the threshold, your kitchen manager is notified via the selected channels.
          Repeat notifications are sent every 4 hours until the item is restocked.
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : rules.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No stock alert rules yet</p>
          <p className="text-sm mt-1">Add rules to get notified when kitchen ingredients run low</p>
        </div>
      ) : (
        <Table columns={columns} data={rules} />
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Alert Rule' : 'New Kitchen Stock Alert Rule'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Raw Material"
              value={form.productId}
              onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
              options={[{ value: '', label: 'Select ingredient…' }, ...productOptions]}
            />
            <Select
              label="Kitchen Store / Warehouse"
              value={form.warehouseId}
              onChange={(e) => setForm((f) => ({ ...f, warehouseId: e.target.value }))}
              options={[{ value: '', label: 'Select warehouse…' }, ...warehouseOptions]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Alert Threshold"
              type="number"
              placeholder="e.g. 5"
              value={form.threshold}
              onChange={(e) => setForm((f) => ({ ...f, threshold: e.target.value }))}
              hint="Send alert when stock falls below this quantity"
            />
            <Select
              label="Unit"
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
              options={unitOptions}
            />
          </div>

          {/* Notification channels */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notify via</p>
            <div className="flex gap-4">
              {([ ['sendEmail', 'Email', Mail], ['sendSms', 'SMS', Phone], ['sendWhatsApp', 'WhatsApp', MessageSquare] ] as const).map(
                ([key, label, Icon]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                      className="rounded"
                    />
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  </label>
                )
              )}
            </div>
          </div>

          <Input
            label="Recipient (email or phone)"
            value={form.recipientContact}
            onChange={(e) => setForm((f) => ({ ...f, recipientContact: e.target.value }))}
            placeholder="chef@restaurant.com or +91 98765 43210"
            hint="Used for all selected channels above"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>
              {editing ? 'Update Rule' : 'Create Rule'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
