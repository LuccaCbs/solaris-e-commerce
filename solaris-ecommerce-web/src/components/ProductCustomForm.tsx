import { ProductFormField } from '../types/productForm'

type ProductCustomFormProps = {
  fields: ProductFormField[]
  values: Record<string, string>
  errors: Record<string, string>
  onChange: (fieldKey: string, value: string) => void
}

const ProductCustomForm = ({ fields, values, errors, onChange }: ProductCustomFormProps) => {
  if (!fields.length) return null

  return (
    <div className="space-y-4 border-t border-gray-100 pt-4 mt-4">
      {fields.map((field) => {
        const value = values[field.fieldKey] ?? ''
        const error = errors[field.fieldKey]
        const inputId = `custom-field-${field.fieldKey}`

        return (
          <div key={field.fieldKey}>
            <label htmlFor={inputId} className="block text-sm font-medium text-gray-800 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>

            {field.fieldType === 'TEXTAREA' ? (
              <textarea
                id={inputId}
                rows={3}
                value={value}
                placeholder={field.placeholder}
                onChange={(e) => onChange(field.fieldKey, e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
              />
            ) : field.fieldType === 'SELECT' ? (
              <select
                id={inputId}
                value={value}
                onChange={(e) => onChange(field.fieldKey, e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">{field.placeholder || 'Seleccionar...'}</option>
                {(field.options || []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.fieldType === 'CHECKBOX' ? (
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  id={inputId}
                  type="checkbox"
                  checked={value === 'true'}
                  onChange={(e) => onChange(field.fieldKey, e.target.checked ? 'true' : '')}
                />
                {field.placeholder || field.label}
              </label>
            ) : (
              <input
                id={inputId}
                type={field.fieldType === 'NUMBER' ? 'number' : field.fieldType === 'COLOR' ? 'color' : 'text'}
                value={value}
                placeholder={field.placeholder}
                onChange={(e) => onChange(field.fieldKey, e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${
                  field.fieldType === 'COLOR' ? 'h-10 p-1' : ''
                } ${error ? 'border-red-500' : 'border-gray-300'}`}
              />
            )}

            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>
        )
      })}
    </div>
  )
}

export default ProductCustomForm
