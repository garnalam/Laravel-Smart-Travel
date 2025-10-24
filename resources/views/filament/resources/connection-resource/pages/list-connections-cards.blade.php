<x-filament::page>
    @php
        $records = $this->getTableRecords();
    @endphp

    @if ($records->isEmpty())
        {{-- Empty State (Giao diện này gần giống code React, giữ nguyên) --}}
        <div class="flex flex-col items-center justify-center p-12 mx-auto space-y-4 text-center bg-white border border-gray-300 rounded-xl dark:bg-gray-800 dark:border-gray-700">
            <div class="flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 text-primary-500 dark:bg-primary-500/20">
                {{-- Icon Database giống React --}}
                <x-heroicon-o-circle-stack class="w-8 h-8"/> 
            </div>
            <h2 class="text-xl font-bold tracking-tight">No connections yet</h2>
            <p class="max-w-md text-sm text-gray-500">Create your first API connection to start extracting data automatically.</p>
            <x-filament::button :href="static::getResource()::getUrl('create')">
                <x-heroicon-o-plus class="w-4 h-4 mr-1 -ml-1"/>
                Create Connection
            </x-filament::button>
        </div>
    @else
        <div class="grid gap-4">
            @foreach ($records as $record)
                {{-- Cấu trúc Card mới dựa trên 'connections/pages.tsx' --}}
                <div class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 transition-colors hover:border-primary-500/50">
                    
                    {{-- Card Header --}}
                    <div class="flex items-start justify-between">
                        <div class="flex-1 space-y-2">
                            <div class="flex items-center gap-3">
                                <h3 class="text-lg font-bold">{{ $record->name ?: 'Untitled Connection' }}</h3>
                                <x-filament::badge color="{{ $record->is_active ? 'success' : 'gray' }}">
                                    {{ $record->is_active ? 'Active' : 'Inactive' }}
                                </x-filament::badge>
                            </div>
                            <p class="text-sm text-gray-500 dark:text-gray-400 text-pretty">
                                {{ $record->description ?: 'No description' }}
                            </p>
                            <p class="pt-1 text-xs text-gray-400 dark:text-gray-500 font-mono">
                                ID: {{ $record->connection_id }}
                            </p>
                        </div>
                        
                        {{-- Nút Configure thay cho Dropdown --}}
                        <x-filament::button 
                            tag="a"
                            color="gray"
                            :href="static::getResource()::getUrl('edit', ['record' => $record->connection_id])">
                            Configure
                        </x-filament::button>
                    </div>

                    {{-- Card Content --}}
                    <div class="pt-6 mt-6 border-t dark:border-gray-700">
                        <div class="flex flex-wrap items-center gap-6 text-sm">
                            <div class="flex items-center gap-2">
                                <x-heroicon-o-circle-stack class="w-4 h-4 text-gray-400"/>
                                <span class="text-gray-500 dark:text-gray-400">Method:</span>
                                <x-filament::badge color="gray" class="font-medium">
                                    {{ $record->apiConfig['method'] ?? 'N/A' }}
                                </x-filament::badge>
                            </div>
                            <div class="flex items-center gap-2">
                                <x-heroicon-o-presentation-chart-line class="w-4 h-4 text-gray-400"/>
                                <span class="text-gray-500 dark:text-gray-400">Total Runs:</span>
                                <span class="font-medium">{{ $record->total_runs ?? 0 }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <x-heroicon-o-calendar class="w-4 h-4 text-gray-400"/>
                                <span class="text-gray-500 dark:text-gray-400">Last Run:</span>
                                <span class="font-medium">{{ $record->last_run_at?->format('d/m/Y, g:i:s A') ?? 'Never' }}</span>
                            </div>
                        </div>

                        @if(!empty($record->apiConfig['baseUrl']))
                            <div class="mt-4 p-2 bg-gray-50 dark:bg-gray-900/50 rounded text-xs font-mono break-all text-gray-600 dark:text-gray-400">
                                {{ $record->apiConfig['baseUrl'] }}
                            </div>
                        @endif
                    </div>
                </div>
            @endforeach
        </div>

        @if ($records->hasPages())
            <div class="mt-6">
                {{ $records->links() }}
            </div>
        @endif
    @endif
</x-filament::page>