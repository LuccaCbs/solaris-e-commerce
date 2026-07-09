import { Search, Filter } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Category } from '../types/category'

export type CatalogFilters = {
  searchTerm: string
  selectedCategory: number | null
  priceMin: string
  priceMax: string
}

type CatalogFilterSidebarProps = {
  filters: CatalogFilters
  categories: Category[]
  onChange: (filters: CatalogFilters) => void
}

const CatalogFilterSidebar = ({ filters, categories, onChange }: CatalogFilterSidebarProps) => {
  const { t } = useTranslation()
  const activeCategories = categories.filter((c) => c.active !== false)

  const update = (partial: Partial<CatalogFilters>) => {
    onChange({ ...filters, ...partial })
  }

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="bg-white rounded-lg shadow p-6 sticky top-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">{t('catalog.filters')}</h2>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('catalog.search')}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('catalog.searchPlaceholder')}
              value={filters.searchTerm}
              onChange={(e) => update({ searchTerm: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('catalog.categories')}
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="category"
                checked={filters.selectedCategory === null}
                onChange={() => update({ selectedCategory: null })}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">{t('catalog.allCategories')}</span>
            </label>
            {activeCategories.map((category) => (
              <label key={category.id} className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  checked={filters.selectedCategory === category.id}
                  onChange={() => update({ selectedCategory: category.id })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('catalog.priceRange')}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder={t('catalog.min')}
              value={filters.priceMin}
              onChange={(e) => update({ priceMin: e.target.value })}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder={t('catalog.max')}
              value={filters.priceMax}
              onChange={(e) => update({ priceMax: e.target.value })}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </aside>
  )
}

export default CatalogFilterSidebar
