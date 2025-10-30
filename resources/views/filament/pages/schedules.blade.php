<x-filament-panels::page>
    
    {{-- Nút "Create Schedule" ở góc trên bên phải --}}
    <x-slot name="headerActions">
        <x-filament::button
            tag="a"
            :href="\App\Filament\Resources\ConnectionResource::getUrl('create')"
            icon="heroicon-o-calendar"
        >
            Create Schedule
        </x-filament::button>
    </x-slot>

    {{-- Lấy các bản ghi từ thuộc tính $records trong class PHP --}}
    @php
        $records = $this->records;
    @endphp

    @if ($records->isEmpty())
        {{-- Giao diện Empty State (trạng thái rỗng) --}}
        <div class="flex flex-col items-center justify-center p-12 mx-auto space-y-4 text-center bg-white border border-dashed border-gray-300 rounded-xl dark:bg-gray-800 dark:border-gray-700">
            <div class="flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 text-primary-500 dark:bg-primary-500/20">
                <x-heroicon-o-calendar class="w-8 h-8"/>
            </div>
            <h2 class="text-xl font-bold tracking-tight">No schedules configured</h2>
            <p class="max-w-md text-sm text-gray-500">
                Create an API connection with automated scheduling to see it here.
            </p>
            <x-filament::button :href="\App\Filament\Resources\ConnectionResource::getUrl('create')">
                Create Connection
            </x-filament::button>
        </div>
    @else
        {{-- Giao diện Card List (danh sách Card) --}}
        <div class="grid gap-4">
            @foreach ($records as $record)
                <div class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    
                    {{-- Card Header --}}
                    <div class="flex items-start justify-between">
                        <div class="flex-1 space-y-2">
                            <div class="flex items-center gap-3">
                                <h3 class="text-lg font-bold">{{ $record->name ?: 'Untitled Connection' }}</h3>
                                <x-filament::badge color="{{ $record->is_active ? 'success' : 'danger' }}">
                                    {{ $record->is_active ? 'Active' : 'Paused' }}
                                </x-filament::badge>
                                <x-filament::badge color="secondary">
                                    {{ $record->schedule_config['type'] ?? 'Manual' }}
                                </x-filament::badge>
                            </div>
                            <p class="text-sm text-gray-500">
                                <code class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">{{ $record->schedule_config['cronExpression'] ?? 'Not scheduled' }}</code>
                            </p>
                        </div>
                        
                        {{-- Dropdown Menu Hành động --}}
                        <x-filament::dropdown placement="bottom-end">
                            <x-slot name="trigger">
                                <button type="button" class="p-2 -m-2 text-gray-400 rounded-full hover:text-gray-500"><x-heroicon-o-ellipsis-vertical class="w-4 h-4"/></button>
                            </x-slot>
                            <x-filament::dropdown.list>
                                {{-- 1. Run Now --}}
                                <x-filament::dropdown.list.item 
                                    icon="heroicon-o-play" 
                                    wire:click="runNow('{{ $record->connection_id }}')">
                                    Run Now
                                </x-filament::dropdown.list.item>
                                
                                {{-- 2. Pause / Resume --}}
                                <x-filament::dropdown.list.item 
                                    icon="{{ $record->is_active ? 'heroicon-o-pause' : 'heroicon-o-play' }}" 
                                    color="{{ $record->is_active ? 'warning' : 'success' }}" 
                                    wire:click="toggleSchedule('{{ $record->connection_id }}')">
                                    {{ $record->is_active ? 'Pause Schedule' : 'Resume Schedule' }}
                                </x-filament::dropdown.list.item>

                                <div class="border-t border-gray-200 dark:border-gray-600"></div>
                                
                                {{-- 3. Delete --}}
                                <x-filament::dropdown.list.item 
                                    icon="heroicon-o-trash" 
                                    color="danger" 
                                    wire:click="confirmDelete('{{ $record->connection_id }}')">
                                    Delete Schedule
                                </x-filament::dropdown.list.item>
                            </x-filament::dropdown.list>
                        </x-filament::dropdown>
                    </div>

                    {{-- Card Content (Dùng các accessor đã tạo) --}}
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 mt-6 border-t dark:border-gray-700">
                        <div class="flex items-center gap-2">
                            <x-heroicon-o-clock class="w-4 h-4 text-gray-400"/>
                            <div>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Next Run</p>
                                <p class="text-sm font-medium">{{ $record->next_run_at ?? 'Not Scheduled' }}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <x-heroicon-o-calendar class="w-4 h-4 text-gray-400"/>
                            <div>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Last Run</p>
                                <p class="text-sm font-medium">{{ $record->last_run_at?->format('d/m/Y, g:i:s A') ?? 'Never' }}</p>
                            </div>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Last Status</p>
                            <x-filament::badge color="{{ $record->last_run_status_color }}" class="mt-1">
                                {{ $record->last_run_status ?? 'Unknown' }}
                            </x-filament::badge>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Total Runs</p>
                            <p class="text-sm font-medium mt-1">{{ $record->total_runs }}</p>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    @endif

    {{-- Dòng này bắt buộc phải có để Modal Delete hoạt động --}}
    <x-filament-actions::modals />
</x-filament-panels::page>