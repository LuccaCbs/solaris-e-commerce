import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { FileText, Plus, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { productFormService } from '../../api/productFormService'
import { productService } from '../../api/productService'
import { FormFieldType, ProductForm, ProductFormField, FORM_FIELD_TYPES } from '../../types/productForm'
import { Product } from '../../types/product'

type FieldDraft = ProductFormField & { optionsText?: string }

const emptyField = (order: number): FieldDraft => ({
  fieldKey: '',
  label: '',
  fieldType: 'TEXT',
  required: false,
  displayOrder: order,
  options: [],
  optionsText: '',
  placeholder: '',
})

const toFieldDraft = (field: ProductFormField): FieldDraft => ({
  ...field,
  optionsText: field.options?.join('\n') || '',
})

const parseOptions = (optionsText?: string) =>
  (optionsText || '')
    .split('\n')
    .map((option) => option.trim())
    .filter(Boolean)

const FormConfigPage = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingForm, setEditingForm] = useState<ProductForm | null>(null)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [active, setActive] = useState(true)
  const [fields, setFields] = useState<FieldDraft[]>([emptyField(0)])

  const { data: forms = [], isLoading } = useQuery({
    queryKey: ['product-forms'],
    queryFn: productFormService.getAll,
  })

  const { data: productsPage } = useQuery({
    queryKey: ['manage-products-forms'],
    queryFn: () => productService.getManageProducts({ size: 200 }),
  })

  const products = productsPage?.content || []
  const madeToOrderProducts = useMemo(
    () => products.filter((product: Product) => product.madeToOrder),
    [products]
  )

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        productId: Number(selectedProductId),
        active,
        fields: fields.map((field, index) => ({
          fieldKey: field.fieldKey,
          label: field.label,
          fieldType: field.fieldType,
          required: field.required,
          displayOrder: index,
          options: field.fieldType === 'SELECT' ? parseOptions(field.optionsText) : [],
          placeholder: field.placeholder || undefined,
        })),
      }

      if (editingForm) {
        return productFormService.update(editingForm.id, payload)
      }
      return productFormService.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-forms'] })
      toast.success(t('admin.formConfig.saved'))
      closeModal()
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error?.response?.data?.message || t('admin.formConfig.error')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productFormService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-forms'] })
      toast.success(t('admin.formConfig.deleted'))
    },
    onError: () => toast.error(t('admin.formConfig.error')),
  })

  const closeModal = () => {
    setModalOpen(false)
    setEditingForm(null)
    setSelectedProductId('')
    setActive(true)
    setFields([emptyField(0)])
  }

  const openCreate = () => {
    setEditingForm(null)
    setSelectedProductId('')
    setActive(true)
    setFields([emptyField(0)])
    setModalOpen(true)
  }

  const openEdit = (form: ProductForm) => {
    setEditingForm(form)
    setSelectedProductId(String(form.productId))
    setActive(form.active)
    setFields(form.fields.length ? form.fields.map(toFieldDraft) : [emptyField(0)])
    setModalOpen(true)
  }

  const addField = () => {
    setFields((prev) => [...prev, emptyField(prev.length)])
  }

  const removeField = (index: number) => {
    setFields((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  const updateField = (index: number, patch: Partial<FieldDraft>) => {
    setFields((prev) => prev.map((field, i) => (i === index ? { ...field, ...patch } : field)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProductId) {
      toast.error(t('admin.formConfig.productRequired'))
      return
    }
    if (fields.some((field) => !field.label.trim())) {
      toast.error(t('admin.formConfig.fieldLabelRequired'))
      return
    }
    saveMutation.mutate()
  }

  const fieldTypeLabel = (type: FormFieldType) => t(`admin.formConfig.fieldTypes.${type}`)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.formConfig.title')}</h1>
          <p className="text-sm text-gray-600 mt-1">{t('admin.formConfig.subtitle')}</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('admin.formConfig.new')}
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">{t('common.loading')}</div>
      ) : forms.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{t('admin.formConfig.empty')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.product.product')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.formConfig.fieldsCount')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.product.status')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('admin.product.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {forms.map((form) => (
                <tr key={form.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{form.productName}</div>
                    <div className="text-xs text-gray-500">ID {form.productId}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{form.fields.length}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${form.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {form.active ? t('admin.product.active') : t('admin.product.inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(form)} className="text-blue-600 hover:underline text-sm">
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(t('admin.formConfig.confirmDelete'))) {
                          deleteMutation.mutate(form.id)
                        }
                      }}
                      className="text-red-600 hover:underline text-sm"
                    >
                      {t('common.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingForm ? t('admin.formConfig.edit') : t('admin.formConfig.new')}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('admin.product.product')} *</label>
                  <select
                    required
                    disabled={Boolean(editingForm)}
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">{t('admin.formConfig.selectProduct')}</option>
                    {(madeToOrderProducts.length ? madeToOrderProducts : products).map((product: Product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}{product.madeToOrder ? ` (${t('admin.product.madeToOrder')})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                    {t('admin.formConfig.formActive')}
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{t('admin.formConfig.fields')}</h3>
                  <button type="button" onClick={addField} className="text-sm text-blue-600 hover:underline">
                    + {t('admin.formConfig.addField')}
                  </button>
                </div>

                {fields.map((field, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {t('admin.formConfig.field')} {index + 1}
                      </span>
                      <button type="button" onClick={() => removeField(index)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">{t('admin.formConfig.fieldLabel')} *</label>
                        <input
                          required
                          value={field.label}
                          onChange={(e) => {
                            const label = e.target.value
                            const autoKey = label
                              .toLowerCase()
                              .trim()
                              .replace(/\s+/g, '_')
                              .replace(/[^a-z0-9_]/g, '')
                            updateField(index, {
                              label,
                              fieldKey: field.fieldKey || autoKey,
                            })
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">{t('admin.formConfig.fieldKey')}</label>
                        <input
                          value={field.fieldKey}
                          onChange={(e) => updateField(index, { fieldKey: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">{t('admin.formConfig.fieldType')}</label>
                        <select
                          value={field.fieldType}
                          onChange={(e) => updateField(index, { fieldType: e.target.value as FormFieldType })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                          {FORM_FIELD_TYPES.map((type) => (
                            <option key={type} value={type}>{fieldTypeLabel(type)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">{t('admin.formConfig.placeholder')}</label>
                        <input
                          value={field.placeholder || ''}
                          onChange={(e) => updateField(index, { placeholder: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                    </div>

                    {field.fieldType === 'SELECT' && (
                      <div>
                        <label className="block text-xs font-medium mb-1">{t('admin.formConfig.options')}</label>
                        <textarea
                          rows={3}
                          value={field.optionsText || ''}
                          onChange={(e) => updateField(index, { optionsText: e.target.value })}
                          placeholder={t('admin.formConfig.optionsPlaceholder')}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                    )}

                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(index, { required: e.target.checked })}
                      />
                      {t('admin.formConfig.required')}
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saveMutation.isPending ? t('common.saving') : t('common.save')}
                </button>
                <button type="button" onClick={closeModal} className="px-4 py-2.5 border rounded-lg hover:bg-gray-50">
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FormConfigPage
