import { useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type ImageUploadFieldProps = {
  files: File[]
  onChange: (files: File[]) => void
  multiple?: boolean
}

const ImageUploadField = ({ files, onChange, multiple = true }: ImageUploadFieldProps) => {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSelect = (selected: FileList | null) => {
    if (!selected?.length) return
    const newFiles = Array.from(selected)
    onChange(multiple ? [...files, ...newFiles] : newFiles)
    if (inputRef.current) inputRef.current.value = ''
  }

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleSelect(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
      >
        <Upload className="w-4 h-4" />
        {t('admin.product.selectImages')}
      </button>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
              >
                <X className="w-3 h-3" />
              </button>
              <p className="text-xs text-gray-500 mt-1 max-w-20 truncate">{file.name}</p>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500">{t('admin.product.multipleImagesHint')}</p>
    </div>
  )
}

export default ImageUploadField
