<x-filament-widgets::widget>
    {{-- Chỉ hiển thị khi importProgress > -1 --}}
    @if ($this->importProgress > -1)
        <x-filament::card>
            <div class="px-4 py-2 space-y-2">
                <div class="flex justify-between items-center gap-3">
                     <span class="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Đang import file JSON, vui lòng chờ...
                    </span>
                    <span class="text-sm font-bold text-gray-700 dark:text-gray-200">
                        {{ $this->importProgress }}%
                    </span>
                </div>
                
                {{-- =============================================== --}}
                {{-- SỬA LỖI: Code progress bar cho Filament v2 --}}
                {{-- =============================================== --}}
                <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div class="bg-primary-600 h-2.5 rounded-full" 
                         style="width: {{ $this->importProgress }}%">
                    </div>
                </div>
                {{-- =============================================== --}}

            </div>
        </x-filament::card>
    @endif
</x-filament-widgets::widget>