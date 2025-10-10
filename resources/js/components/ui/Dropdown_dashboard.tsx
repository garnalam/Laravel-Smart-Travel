import { Fragment, useState, useRef } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropdownOption {
  value: string
  label: string
  disabled?: boolean
}

interface DropdownProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: DropdownOption[]
  placeholder?: string
  required?: boolean
  error?: string
  className?: string
  filter?: boolean
  clearable?: boolean
  language?: 'en' | 'vi'
  loading?: boolean
  disabled?: boolean
}

export function Dropdown({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  required = false,
  error,
  className,
  filter = true,
  clearable = false,
  language = 'en',
  loading = false,
  disabled = false
}: DropdownProps) {
  const [query, setQuery] = useState('')
  const buttonRef = useRef<HTMLButtonElement>(null)

  const selectedOption = options.find(option => option.value === value)
  
  const messages = {
    noResults: language === 'vi' ? 'Không tìm thấy kết quả' : 'No results found',
    noData: language === 'vi' ? 'Không có dữ liệu' : 'No data available',
    results: language === 'vi' ? 'Kết quả' : 'Results',
    clear: language === 'vi' ? 'Xóa' : 'Clear',
    loading: language === 'vi' ? 'Đang tải...' : 'Loading...'
  }

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) =>
          option.label
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        )

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-gray-700 text-sm font-bold mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <Combobox value={value} onChange={onChange} disabled={disabled || loading}>
        <div className="relative">
          <div className="relative w-full">
            <Combobox.Input
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors bg-white cursor-pointer',
                clearable && value ? 'pr-16' : 'pr-10',
                error && 'border-red-400',
                (disabled || loading) && 'opacity-50 cursor-not-allowed'
              )}
              displayValue={() => loading ? messages.loading : (selectedOption?.label || '')}
              onChange={(event) => setQuery(event.target.value)}
              onClick={() => {
                // Trigger button click để mở dropdown
                if (buttonRef.current && !disabled && !loading) {
                  buttonRef.current.click()
                }
              }}
              placeholder={placeholder}
              disabled={disabled || loading}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
              {clearable && value && !loading && !disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onChange('')
                    setQuery('')
                  }}
                  className="px-2 hover:bg-gray-100 rounded transition-colors pointer-events-auto"
                  title={messages.clear}
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
              <Combobox.Button ref={buttonRef} className="pr-3 pointer-events-auto">
                <ChevronDown
                  className="h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
              </Combobox.Button>
            </div>
          </div>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {filter && query.length > 0 && filteredOptions.length > 0 && (
                <div className="px-3 py-2 text-xs text-gray-500 flex items-center gap-2 border-b border-gray-100">
                  <Search className="h-3 w-3" />
                  <span>{messages.results}: {filteredOptions.length}</span>
                </div>
              )}
              
              {filteredOptions.length === 0 ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-500 text-sm text-center">
                  {query !== '' ? messages.noResults : messages.noData}
                </div>
              ) : (
                filteredOptions.filter(option => option.value !== '').map((option) => (
                  <Combobox.Option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={({ active }) =>
                      cn(
                        'relative cursor-pointer select-none py-2 pl-10 pr-4 transition-colors',
                        active ? 'bg-blue-50 text-blue-900' : 'text-gray-900',
                        option.disabled && 'opacity-50 cursor-not-allowed'
                      )
                    }
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={cn(
                            'block truncate',
                            selected ? 'font-semibold' : 'font-normal'
                          )}
                        >
                          {option.label}
                        </span>
                        {selected ? (
                          <span
                            className={cn(
                              'absolute inset-y-0 left-0 flex items-center pl-3',
                              active ? 'text-blue-600' : 'text-blue-600'
                            )}
                          >
                            <Check className="h-4 w-4" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  )
}

