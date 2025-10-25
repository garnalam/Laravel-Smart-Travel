<?php

    namespace App\Filament\Resources;

    use App\Filament\Resources\ConnectionResource\Pages;
    use App\Models\Connection;
    use Filament\Forms;
    use Filament\Forms\Form;
    use Filament\Resources\Resource;
    use Filament\Tables;
    use Filament\Tables\Table;
    use Filament\Infolists;
    use Filament\Infolists\Infolist;
    use Filament\Forms\Get;
    use Illuminate\Database\Eloquent\Builder; // BẮT BUỘC THÊM DÒNG NÀY
    use Illuminate\Support\HtmlString;

    class ConnectionResource extends Resource
    {
        protected static ?string $model = Connection::class;

        protected static ?string $navigationIcon = 'heroicon-o-bolt';

        /**
         * Sửa lại URL để dùng slug 'connections' và trường 'connection_id'.
         */
        public static function getRecordRouteKeyName(): ?string
            {
                return 'connection_id';
            }
        /**
         * Hàm form() chính, được chia nhỏ để code sạch hơn.
         */
        public static function form(Form $form): Form
        {
            return $form->schema([
                Forms\Components\Wizard::make([
                    static::getApiConfigurationStep(),
                    static::getParametersStep(),
                    static::getDataMappingStep(),
                    static::getScheduleStep(),
                    static::getReviewStep(),
                ])->columnSpanFull(),
            ]);
        }

        /**
         * Cấu hình bảng danh sách.
         */
        public static function table(Table $table): Table
        {
            return $table
                ->columns([
                    Tables\Columns\TextColumn::make('name')
                        ->searchable()
                        ->sortable()
                        ->description(fn (Connection $record): string => $record->description ?? ''),
                    Tables\Columns\BadgeColumn::make('apiConfig.method')
                        ->label('Method'),
                    Tables\Columns\TextColumn::make('apiConfig.baseUrl')
                        ->label('URL')
                        ->limit(35)
                        ->copyable(),
                    Tables\Columns\ToggleColumn::make('is_active')->label('Status'),
                    Tables\Columns\TextColumn::make('last_run_at')->dateTime()->sortable(),
                ])
                ->defaultSort('created_at', 'desc')
                ->filters([
                    //
                ])
                ->actions([
                    Tables\Actions\ViewAction::make(),
                    Tables\Actions\EditAction::make(),
                ])
                ->bulkActions([
                    Tables\Actions\BulkActionGroup::make([
                        Tables\Actions\DeleteBulkAction::make(),
                    ]),
                ]);
        }
        /**
         * Cấu hình trang xem chi tiết (Infolist).
         */
        public static function infolist(Infolist $infolist): Infolist
        {
            return $infolist
                ->schema([
                    Infolists\Components\Section::make('Connection Details')->schema([
                        Infolists\Components\TextEntry::make('name'),
                        Infolists\Components\TextEntry::make('connection_id')->label('Connection ID')->copyable(),
                        Infolists\Components\TextEntry::make('description'),
                        Infolists\Components\TextEntry::make('apiConfig.baseUrl')->label('Base URL')->copyable(),
                        Infolists\Components\TextEntry::make('apiConfig.method')->label('Method'),
                        Infolists\Components\IconEntry::make('is_active')->boolean(),
                    ])->columns(2),
                    // Các section khác có thể thêm sau...
                ]);
        }

        public static function getRelations(): array
        {
            return [
                //
            ];
        }

        /**
         * Đăng ký các trang.
         */
        public static function getPages(): array
            {
                return [
                    'index' => Pages\ListConnections::route('/'),
                    'create' => Pages\CreateConnection::route('/create'),
                    'view' => Pages\ViewConnection::route('/{record:connection_id}'),
                    'edit' => Pages\EditConnection::route('/{record:connection_id}/edit'),
                ];
            }

        // =================================================================
        // CÁC HÀM RIÊNG CHO TỪNG BƯỚC CỦA WIZARD
        // =================================================================

        protected static function getApiConfigurationStep(): Forms\Components\Wizard\Step
    {
        return Forms\Components\Wizard\Step::make('API Configuration')
            ->description('Configure endpoint and authentication')
            ->schema([
                Forms\Components\Section::make('Basic Information')
                    ->schema([
                        Forms\Components\TextInput::make('name')->label('Connection Name'),
                        Forms\Components\Textarea::make('description')->rows(3),
                    ]),

                Forms\Components\Section::make('API Endpoint')
                    ->schema([
                        Forms\Components\Grid::make(4)->schema([
                            Forms\Components\Select::make('apiConfig.method')->label('Method')
                                ->options(['GET' => 'GET', 'POST' => 'POST', 'PUT' => 'PUT', 'PATCH' => 'PATCH', 'DELETE' => 'DELETE'])
                                ->default('GET'),
                            Forms\Components\TextInput::make('apiConfig.baseUrl')->label('Base URL')
                                ->url()->placeholder('https://api.example.com/v1/users')
                                ->columnSpan(3),
                        ]),
                    ]),

    Forms\Components\Section::make('Headers')
        ->schema([
            // THÊM MỚI: Placeholder này chỉ hiển thị khi danh sách headers rỗng
            Forms\Components\Placeholder::make('headers_empty_state')
                ->label(false)
                ->content('No headers added yet.')
                ->visible(fn (Get $get) => empty($get('apiConfig.headers'))),

            // SỬA LẠI: Repeater không còn gọi đến phương thức gây lỗi
            Forms\Components\Repeater::make('apiConfig.headers')->label(false)
                ->schema([
                    Forms\Components\TextInput::make('key')->placeholder('Header name'),
                    Forms\Components\TextInput::make('value')->placeholder('Header value'),
                ])
                ->columns(2)
                ->addActionLabel('Add Header')
                // ->emptyStateLabel('No headers added yet.'), // <-- DÒNG GÂY LỖI ĐÃ BỊ XÓA HOÀN TOÀN
        ]),

                Forms\Components\Section::make('Authentication')
                    ->schema([
                        Forms\Components\Select::make('apiConfig.authType')->label('Authentication Type')
                            ->options(['none' => 'None', 'bearer' => 'Bearer Token', 'basic' => 'Basic Auth', 'api_key' => 'API Key'])
                            ->default('none')->reactive(),
                        Forms\Components\TextInput::make('apiConfig.authConfig.token')->label('Bearer Token')
                            ->password()
                            ->visible(fn (Get $get) => $get('apiConfig.authType') === 'bearer'),
                        Forms\Components\Grid::make(2)->schema([
                            Forms\Components\TextInput::make('apiConfig.authConfig.username')->label('Username'),
                            Forms\Components\TextInput::make('apiConfig.authConfig.password')->label('Password')->password(),
                        ])->visible(fn (Get $get) => $get('apiConfig.authType') === 'basic'),
                        Forms\Components\Grid::make(2)->schema([
                            Forms\Components\TextInput::make('apiConfig.authConfig.keyName')->label('Key Name')->placeholder('e.g., X-API-Key'),
                            Forms\Components\TextInput::make('apiConfig.authConfig.keyValue')->label('Key Value')->password(),
                        ])->visible(fn (Get $get) => $get('apiConfig.authType') === 'api_key'),
                    ]),
            ]);
    }

    // app/Filament/Resources/ConnectionResource.php

    protected static function getParametersStep(): Forms\Components\Wizard\Step
    {
        return Forms\Components\Wizard\Step::make('Parameters')
            ->description('Set up request parameters')
            ->schema([
                // 1. Info Banner (Giữ nguyên)
                Forms\Components\Placeholder::make('info_banner')
                    ->label(false)
                    ->content(new HtmlString('
                        <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                            <div class="flex items-start gap-3">
                                <svg class="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
                                <div class="space-y-1">
                                    <p class="font-bold text-sm">Parameter Modes</p>
                                    <ul class="text-sm text-gray-500 list-disc list-inside mt-1 space-y-1">
                                        <li><strong>List:</strong> Thực thi API một lần cho mỗi giá trị.</li>
                                        <li><strong>Cartesian:</strong> Tạo ra tất cả các tổ hợp của nhiều tham số.</li>
                                        <li><strong>Template:</strong> Sử dụng các mẫu động với biến.</li>
                                        <li><strong>Dynamic:</strong> Tạo giá trị dựa trên khoảng ngày hoặc các lần chạy trước.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ')),

                // 2. Repeater
                Forms\Components\Repeater::make('parameters')
                    ->schema([
                        Forms\Components\Grid::make(2)->schema([
                            Forms\Components\TextInput::make('name')->label('Parameter Name')/*->required()*/,
                            Forms\Components\Select::make('type')->label('Parameter Type')
                                ->options(['query' => 'Query Parameter', 'path' => 'Path Parameter', 'body' => 'Body Parameter', 'header' => 'Header Parameter'])
                                ->default('query'),
                        ]),
                        Forms\Components\Toggle::make('isRequired')->label('Required Parameter'),
                        
                        // --- ĐÃ THAY THẾ TABS BẰNG RADIO ---
                        Forms\Components\Radio::make('mode')->label('Parameter Mode')
                            ->options([
                                'list' => 'List',
                                'cartesian' => 'Cartesian',
                                'template' => 'Template',
                                'dynamic' => 'Dynamic',
                            ])
                            ->default('list')
                            ->columns(4) // Sắp xếp các lựa chọn theo hàng ngang
                            ->reactive(), // Bắt buộc phải có để các trường khác lắng nghe

                        // --- Các trường "nội dung" của tab, giờ sẽ dùng ->visible() ---
                        Forms\Components\Textarea::make('values')->label('Values (một giá trị mỗi dòng)')
                            ->helperText('API sẽ được gọi một lần cho mỗi giá trị.')
                            ->formatStateUsing(fn (?array $state): string => is_array($state) ? implode("\n", $state) : '')
                            ->dehydrateStateUsing(fn (?string $state): array => $state ? array_filter(explode("\n", $state)) : [])
                            ->visible(fn (Get $get) => $get('mode') === 'list'),

                        Forms\Components\Textarea::make('values_cartesian')->label('Values (một giá trị mỗi dòng)')
                            ->helperText('Sẽ kết hợp với các tham số cartesian khác để tạo tổ hợp.')
                            ->formatStateUsing(fn (?array $state): string => is_array($state) ? implode("\n", $state) : '')
                            ->dehydrateStateUsing(fn (?string $state): array => $state ? array_filter(explode("\n", $state)) : [])
                            ->visible(fn (Get $get) => $get('mode') === 'cartesian'),

                        Forms\Components\TextInput::make('template')->label('Template String')->placeholder('e.g., user_{{id}}_{{date}}')
                            ->visible(fn (Get $get) => $get('mode') === 'template'),
                            
                        Forms\Components\Group::make()->schema([
                            Forms\Components\Select::make('dynamicConfig.type')->label('Dynamic Type')
                                ->options(['date_range' => 'Date Range', 'incremental_id' => 'Incremental ID']),
                            Forms\Components\Grid::make(2)->schema([
                                Forms\Components\DatePicker::make('dynamicConfig.startDate')->label('Start Date'),
                                Forms\Components\DatePicker::make('dynamicConfig.endDate')->label('End Date'),
                            ]),
                        ])->visible(fn (Get $get) => $get('mode') === 'dynamic'),

                    ])
                    ->addActionLabel('Add Parameter')
                    ->collapsible()
                    ->itemLabel(function (array $state): ?string {
                        if (blank($state['name'])) {
                            return null;
                        }
                        return $state['name'] . ' (' . ($state['type'] ?? '') . ' - ' . ($state['mode'] ?? '') . ')';
                    }),
            ]);
    }

        protected static function getDataMappingStep(): Forms\Components\Wizard\Step
    {
        return Forms\Components\Wizard\Step::make('Data Mapping')
            ->description('Map response fields to database')
            ->schema([
                // Section "Test API Connection"
                Forms\Components\Section::make('Test API Connection')
                    ->description('Kiểm tra API của bạn để xem trước cấu trúc response và tự động phát hiện các trường.')
                    ->schema([
                        Forms\Components\Actions::make([
                            Forms\Components\Actions\Action::make('test_connection')
                                ->label('Test Connection')
                                ->icon('heroicon-o-play')
                                ->action(function (Get $get, callable $set) {
                                    // MOCK DATA TẠM THỜI
                                    $mockResponse = [
                                        'id' => 1, 'name' => "John Doe", 'email' => "john@example.com",
                                        'company' => ['name' => "Acme Corp", 'catchPhrase' => "Innovative solutions"],
                                        'address' => ['street' => "123 Main St", 'city' => "New York"],
                                    ];
                                    
                                    $detectedFields = [];
                                    $extract = function ($obj, $prefix = '') use (&$extract, &$detectedFields) {
                                        foreach ($obj as $key => $value) {
                                            $newPath = $prefix ? $prefix . '.' . $key : $key;
                                            if (is_array($value) && !empty($value) && array_keys($value) !== range(0, count($value))) {
                                                $extract($value, $newPath);
                                            } else {
                                                $detectedFields[] = [
                                                    'isSelected' => true,
                                                    'sourcePath' => $newPath,
                                                    'targetField' => strtolower(preg_replace('/[^a-zA-Z0-9]/', '_', $key)),
                                                    'dataType' => is_numeric($value) ? 'number' : 'string',
                                                ];
                                            }
                                        }
                                    };
                                    $extract($mockResponse);

                                    $set('data_mapping.field_mappings', $detectedFields);

                                    \Filament\Notifications\Notification::make()->success()->title('Connection successful!')->body('Detected ' . count($detectedFields) . ' fields.')->send();
                                }),
                        ]),
                    ]),

                // Group "Field Mapping"
                Forms\Components\Group::make()
                    ->schema([
                        Forms\Components\Section::make('Field Mapping')
                            ->description('Chọn các trường để trích xuất và ánh xạ chúng vào các cột database của bạn.')
                            ->schema([
                                Forms\Components\TextInput::make('data_mapping.tableName')
                                    ->label('Target Table Name *')
                                    ->prefixIcon('heroicon-o-table-cells'), // <-- ĐÃ SỬA LỖI Ở ĐÂY

                                Forms\Components\Actions::make([
                                    Forms\Components\Actions\Action::make('select_all')
                                        ->label('Select All')
                                        ->action(function(Get $get, callable $set) {
                                            $fields = $get('data_mapping.field_mappings');
                                            if (!$fields) return;
                                            foreach($fields as &$field) {
                                                $field['isSelected'] = true;
                                            }
                                            $set('data_mapping.field_mappings', $fields);
                                        }),
                                    Forms\Components\Actions\Action::make('deselect_all')
                                        ->label('Deselect All')
                                        ->color('secondary')
                                        ->action(function(Get $get, callable $set) {
                                            $fields = $get('data_mapping.field_mappings');
                                            if (!$fields) return;
                                            foreach($fields as &$field) {
                                                $field['isSelected'] = false;
                                            }
                                            $set('data_mapping.field_mappings', $fields);
                                        }),
                                ]),

                                Forms\Components\Repeater::make('data_mapping.field_mappings')
                                    ->label('Fields')
                                    ->schema([
                                        Forms\Components\Checkbox::make('isSelected')->label('Select')
                                            ->columnSpan(1)->reactive(),
                                        Forms\Components\TextInput::make('sourcePath')->label('Source Path')
                                            ->columnSpan(4)->disabled(),
                                        Forms\Components\TextInput::make('targetField')->label('Target Column')
                                            ->columnSpan(4)
                                            ->disabled(fn (Get $get) => !$get('isSelected')),
                                        Forms\Components\Select::make('dataType')->label('Data Type')
                                            ->options(['string' => 'String', 'number' => 'Number', 'boolean' => 'Boolean', 'date' => 'Date', 'json' => 'JSON'])
                                            ->default('string')
                                            ->columnSpan(3)
                                            ->disabled(fn (Get $get) => !$get('isSelected')),
                                    ])
                                    ->columns(12)
                                    ->disableItemMovement()
                                    ->disableItemDeletion(),
                            ]),
                    ])
                    ->visible(fn (Get $get) => !empty($get('data_mapping.field_mappings'))),

                // Group "Data Transformation"
                Forms\Components\Group::make()
                    ->schema([
                        Forms\Components\Section::make('Data Transformation')
                            ->description('Cấu hình cách dữ liệu được xử lý trước khi lưu trữ.')
                            ->schema([
                                Forms\Components\Grid::make(2)->schema([
                                    Forms\Components\Toggle::make('data_mapping.options.deduplicate')
                                        ->label('Deduplicate Records'),
                                    Forms\Components\Toggle::make('data_mapping.options.normalize')
                                        ->label('Normalize Data'),
                                    Forms\Components\Toggle::make('data_mapping.options.validateSchema')
                                        ->label('Validate Schema')
                                        ->default(true),
                                    Forms\Components\Toggle::make('data_mapping.options.storeRaw')
                                        ->label('Store Raw Data')
                                        ->default(true),
                                ])
                            ]),
                    ])
                    ->visible(fn (Get $get) => !empty($get('data_mapping.field_mappings'))),
            ]);
    }

    

    protected static function getScheduleStep(): Forms\Components\Wizard\Step
    {
        // Phần closure $updateCronExpression giữ nguyên
        $updateCronExpression = function (Get $get, callable $set) {
            $type = $get('schedule_config.type');
            $config = $get('schedule_config.config') ?? [];
            $time = '00:00';
            if ($type === 'daily' && isset($config['daily_time'])) { $time = $config['daily_time']; }
            elseif ($type === 'weekly' && isset($config['weekly_time'])) { $time = $config['weekly_time']; }
            elseif ($type === 'monthly' && isset($config['monthly_time'])) { $time = $config['monthly_time']; }
            [$hour, $minute] = explode(':', $time);
            $hour = intval($hour);
            $minute = intval($minute);
            $cron = match ($type) {
                'hourly' => "{$minute} * * * *",
                'daily' => "{$minute} {$hour} * * *",
                'weekly' => "{$minute} {$hour} * * " . ($config['weekly_day'] ?? '1'),
                'monthly' => "{$minute} {$hour} " . ($config['monthly_day'] ?? '1') . " * *",
                default => null,
            };
            if ($cron) { $set('schedule_config.cronExpression', $cron); }
        };

        return Forms\Components\Wizard\Step::make('Schedule')
            ->description('Configure automated runs')
            ->schema([
                // Card "Enable Scheduling"
                Forms\Components\Section::make('Enable Automated Scheduling')
                    ->description('Run this API connection automatically on a schedule.')
                    ->schema([
                        Forms\Components\Toggle::make('schedule_config.enabled')
                            ->label('Enable Scheduling')->reactive(),
                    ])
                    ->collapsible()->collapsed(fn (Get $get) => !$get('schedule_config.enabled')),

                // Group chứa toàn bộ cấu hình
                Forms\Components\Group::make()
                    ->schema([
                        // Section "Schedule Type"
                        Forms\Components\Section::make('Schedule Type')
                            ->description('Choose how frequently to run this API connection.')
                            ->schema([
                                Forms\Components\Radio::make('schedule_config.type')
                                    ->label(false)
                                    ->options([
                                        'once' => 'Once',
                                        'hourly' => 'Hourly',
                                        'daily' => 'Daily',
                                        'weekly' => 'Weekly',
                                        'monthly' => 'Monthly',
                                    ])
                                    ->columns(5)
                                    ->default('daily')
                                    ->reactive()
                                    ->afterStateUpdated($updateCronExpression),
                            ]),

                        // --- Các "TabsContent" ---
                        Forms\Components\Grid::make(2)->schema([
                            Forms\Components\DatePicker::make('schedule_config.config.once_date')->label('Run Date'),
                            Forms\Components\TimePicker::make('schedule_config.config.once_time')->label('Run Time'),
                        ])->visible(fn (Get $get) => $get('schedule_config.type') === 'once'), // <-- DẤU PHẨY ĐÃ ĐƯỢC THÊM

                        Forms\Components\Placeholder::make('hourly_info')
                            ->content('The API will be called at the start of every hour (e.g., 1:00, 2:00, 3:00).')
                            ->visible(fn (Get $get) => $get('schedule_config.type') === 'hourly'),

                        Forms\Components\TimePicker::make('schedule_config.config.daily_time')->label('Run Time')
                            ->helperText('API will run every day at this time.')
                            ->visible(fn (Get $get) => $get('schedule_config.type') === 'daily')
                            ->reactive()->afterStateUpdated($updateCronExpression),

                        Forms\Components\Grid::make(2)->schema([
                            Forms\Components\Select::make('schedule_config.config.weekly_day')->label('Day of Week')
                                ->options(['0' => 'Sunday', '1' => 'Monday', '2' => 'Tuesday', '3' => 'Wednesday', '4' => 'Thursday', '5' => 'Friday', '6' => 'Saturday'])
                                ->default('1')->reactive()->afterStateUpdated($updateCronExpression),
                            Forms\Components\TimePicker::make('schedule_config.config.weekly_time')->label('Run Time')
                                ->reactive()->afterStateUpdated($updateCronExpression),
                        ])->visible(fn (Get $get) => $get('schedule_config.type') === 'weekly'),

                        Forms\Components\Grid::make(2)->schema([
                            Forms\Components\Select::make('schedule_config.config.monthly_day')->label('Day of Month')
                                ->options(array_combine(range(1, 31), range(1, 31)))->default('1')
                                ->reactive()->afterStateUpdated($updateCronExpression),
                            Forms\Components\TimePicker::make('schedule_config.config.monthly_time')->label('Run Time')
                                ->reactive()->afterStateUpdated($updateCronExpression),
                        ])->visible(fn (Get $get) => $get('schedule_config.type') === 'monthly'),

                        // Section "Advanced CRON"
                        Forms\Components\Section::make('Advanced: Custom CRON Expression')
                            ->schema([
                                Forms\Components\TextInput::make('schedule_config.cronExpression')->label('CRON Expression'),
                            ]),

                        // Section "Retry Configuration"
                        Forms\Components\Section::make('Retry Configuration')
                            ->schema([
                                Forms\Components\Grid::make(2)->schema([
                                    Forms\Components\Select::make('schedule_config.config.maxRetries')->label('Max Retries')
                                        ->options(['0' => 'No retries', '1' => '1 retry', '3' => '3 retries', '5' => '5 retries'])
                                        ->default('3'),
                                    Forms\Components\Select::make('schedule_config.config.retryDelay')->label('Retry Delay (seconds)')
                                        ->options(['30' => '30 seconds', '60' => '1 minute', '300' => '5 minutes'])
                                        ->default('60'),
                                ]),
                            ]),

                        // Section "Next Run Preview"
                        Forms\Components\Section::make()->schema([
                            Forms\Components\Placeholder::make('next_run_preview')
                                ->label('Next Scheduled Run')
                                ->content(fn() => now()->addDay()->format('d/m/Y, g:i:s A')),
                        ]),
                    ])
                    ->visible(fn (Get $get) => $get('schedule_config.enabled')),
            ]);
    }


    // app/Filament/Resources/ConnectionResource.php

    protected static function getReviewStep(): Forms\Components\Wizard\Step
    {
        return Forms\Components\Wizard\Step::make('Review')
            ->description('Review and create connection')
            ->schema([
                // 1. Summary Banner
                Forms\Components\Placeholder::make('summary_banner')
                    ->label(false)
                    ->content(new HtmlString('
                        <div class="p-4 rounded-lg bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/30">
                            <div class="flex items-start gap-3">
                                <svg class="h-6 w-6 text-primary-500 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                <div>
                                    <p class="font-bold text-primary-700 dark:text-primary-400">Ready to Create Connection</p>
                                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Review your configuration below. You can edit any section by going back to previous steps.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ')),

                // 2. Placeholder chứa toàn bộ các Card review chi tiết
                Forms\Components\Placeholder::make('review_details')
                    ->label(false)
                    ->content(function (Get $get): HtmlString {
                        // Lấy toàn bộ dữ liệu từ các bước trước
                        $name = $get('name');
                        $apiConfig = $get('apiConfig') ?? [];
                        $parameters = collect($get('parameters') ?? []);
                        $dataMapping = $get('data_mapping') ?? [];
                        $schedule = $get('schedule_config') ?? [];

                        // --- Helper Functions ---
                        $badge = fn($text, $color = 'gray') => "<span class=\"inline-flex items-center rounded-md bg-{$color}-50 px-2 py-1 text-xs font-medium text-{$color}-700 ring-1 ring-inset ring-{$color}-600/20 dark:bg-{$color}-500/10 dark:text-{$color}-400 dark:ring-{$color}-500/20\">{$text}</span>";
                        $card = fn($title, $icon, $content) => "<section class=\"rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800\"><div class=\"p-6\"><div class=\"flex items-center gap-2 mb-4\"><svg class=\"h-5 w-5 text-gray-500\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\">{$icon}</path></svg><h3 class=\"font-bold\">{$title}</h3></div><div class=\"space-y-4\">{$content}</div></div></section>";
                        $detail = fn($label, $value) => "<div><p class=\"text-xs text-gray-500\">{$label}</p><div class=\"text-sm font-medium mt-1\">{$value}</div></div>";

                        // --- Build HTML cho từng Card ---

                        // Card API Config
                        $headers = collect($apiConfig['headers'] ?? []);
                        $apiConfigContent = "<div class=\"grid grid-cols-2 gap-4\">" . $detail('Connection Name', e($name) ?: 'Not set') . $detail('Method', $badge($apiConfig['method'] ?? 'GET')) . "</div>" . $detail('Base URL', '<p class="font-mono bg-gray-50 dark:bg-white/5 p-2 rounded break-all">' . e($apiConfig['baseUrl'] ?? 'Not set') . '</p>') . $detail('Authentication', $badge(e($apiConfig['authType'] ?? 'none'))) . ($headers->isNotEmpty() ? $detail("Headers ({$headers->count()})", "<div class=\"space-y-1\">" . $headers->map(fn($h) => "<div class=\"text-xs bg-gray-50 dark:bg-white/5 p-2 rounded font-mono\"><span class=\"text-gray-500\">" . e($h['key']) . ":</span> " . e($h['value']) . "</div>")->implode('') . "</div>") : '');
                        $apiConfigHtml = $card('API Configuration', '<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5" />', $apiConfigContent);

                        // Card Parameters
                        $parametersContent = $parameters->isEmpty() ? '<p class="text-sm text-gray-500">No parameters configured</p>' : $parameters->map(function ($p) use ($badge) { $valuesRaw = $p['values'] ?? ($p['values_cartesian'] ?? null); $valuesArray = is_array($valuesRaw) ? $valuesRaw : ($valuesRaw ? array_filter(explode("\n", $valuesRaw)) : []); $valuesCount = count($valuesArray); $valuesDesc = match ($p['mode'] ?? 'list') { 'list', 'cartesian' => "{$valuesCount} values", 'template' => "Template: " . e($p['template'] ?? ''), default => 'Dynamic' }; return "<div class=\"flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg\"><div><p class=\"text-sm font-medium\">".e($p['name'])."</p><p class=\"text-xs text-gray-500 mt-1\">{$valuesDesc}</p></div><div class=\"flex items-center gap-2\">" . $badge($p['type']) . $badge($p['mode'], 'primary') . (($p['isRequired'] ?? false) ? $badge('Required', 'success') : '') . "</div></div>"; })->implode('');
                        $parametersHtml = $card('Parameters', '<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />', $parametersContent);

                        // Card Data Mapping
                        $selectedFields = collect($dataMapping['field_mappings'] ?? [])->where('isSelected', true);
                        $dataMappingContent = $detail('Target Table', '<p class="font-mono">' . e($dataMapping['tableName'] ?? 'Not set') . '</p>') . $detail("Selected Fields ({$selectedFields->count()})", $selectedFields->isNotEmpty() ? "<div class=\"mt-2 space-y-1 max-h-48 overflow-y-auto border rounded-lg p-2\">" . $selectedFields->map(fn($f) => "<div class=\"flex items-center justify-between p-2 bg-gray-50 dark:bg-white/5 rounded text-xs\"><code class=\"text-gray-500\">".e($f['sourcePath'])."</code><span>→</span><span class=\"font-medium\">".e($f['targetField'])."</span>" . $badge($f['dataType']) . "</div>")->implode('') . "</div>" : '<p class="text-xs text-gray-500 mt-1">No fields selected.</p>');
                        // --- ĐÂY LÀ DÒNG BỊ THIẾU TRƯỚC ĐÂY ---
                        $dataMappingHtml = $card('Data Mapping', '<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12a2.25 2.25 0 0 0 2.25 2.25H18a2.25 2.25 0 0 0 2.25-2.25M4.5 12V5.25A2.25 2.25 0 0 1 6.75 3h10.5a2.25 2.25 0 0 1 2.25 2.25v6.75M4.5 12V21a2.25 2.25 0 0 0 2.25 2.25H18a2.25 2.25 0 0 0 2.25-2.25V12" />', $dataMappingContent);

                        // Card Schedule
                        $scheduleContent = !($schedule['enabled'] ?? false) ? '<p class="text-sm text-gray-500">Automated scheduling is disabled</p>' : "<div class=\"grid grid-cols-2 gap-4\">" . $detail('Schedule Type', $badge($schedule['type'] ?? 'daily')) . $detail('CRON Expression', '<code class="bg-gray-50 dark:bg-white/5 p-1 rounded">' . e($schedule['cronExpression'] ?? 'Not set') . '</code>') . "</div>";
                        $scheduleHtml = $card('Schedule', '<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M12 12.75h.008v.008H12v-.008Z" />', $scheduleContent);

                        // Card Estimated Impact
                        $apiCalls = $parameters->reduce(function ($carry, $p) { if (!in_array($p['mode'] ?? '', ['list', 'cartesian'])) { return $carry; } $valuesRaw = $p['values'] ?? ($p['values_cartesian'] ?? null); $valuesArray = is_array($valuesRaw) ? $valuesRaw : ($valuesRaw ? array_filter(explode("\n", $valuesRaw)) : []); return $carry * (count($valuesArray) ?: 1); }, 1);
                        $runsPerDay = ($schedule['enabled'] ?? false) ? (($schedule['type'] ?? '') === 'hourly' ? 24 : 1) : 0;
                        $impactContent = "<div class=\"grid grid-cols-3 gap-4 text-center\"><div><p class=\"text-xs text-gray-500\">API Calls per Run</p><p class=\"text-2xl font-bold\">{$apiCalls}</p></div><div><p class=\"text-xs text-gray-500\">Fields to Extract</p><p class=\"text-2xl font-bold\">{$selectedFields->count()}</p></div><div><p class=\"text-xs text-gray-500\">Runs per Day</p><p class=\"text-2xl font-bold\">{$runsPerDay}</p></div></div>";
                        $impactHtml = $card('Estimated Impact', '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />', $impactContent);

                        // --- Kết hợp tất cả lại ---
                        return new HtmlString("<div class=\"space-y-6\">{$apiConfigHtml}{$parametersHtml}{$dataMappingHtml}{$scheduleHtml}{$impactHtml}</div>");
                    }),

                // Toggle cuối cùng để kích hoạt
                Forms\Components\Toggle::make('is_active')
                    ->label('Activate this connection upon creation')
                    ->default(true),
            ]);
    }
    }