<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Tour Itinerary - {{ $tourData['destination'] ?? 'Tour' }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #333;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 3px solid #2563eb;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #2563eb;
            margin: 0 0 10px 0;
        }
        .summary-box {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .summary-item {
            display: inline-block;
            width: 48%;
            margin-bottom: 10px;
        }
        .summary-label {
            font-weight: bold;
            color: #6b7280;
        }
        .day-section {
            page-break-inside: avoid;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }
        .day-header {
            background: #2563eb;
            color: white;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
        }
        .activity-item {
            background: #f9fafb;
            padding: 10px;
            margin-bottom: 8px;
            border-left: 4px solid #10b981;
            border-radius: 4px;
        }
        .activity-time {
            color: #2563eb;
            font-weight: bold;
        }
        .activity-type {
            display: inline-block;
            padding: 2px 8px;
            background: #dbeafe;
            border-radius: 3px;
            font-size: 10px;
            text-transform: uppercase;
        }
        .cost {
            float: right;
            font-weight: bold;
            color: #059669;
        }
        .total-section {
            background: #eff6ff;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin-top: 20px;
        }
        .total-amount {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
        }
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌍 Your Travel Itinerary</h1>
        <p><strong>{{ $tourData['destination'] ?? 'Tour Destination' }}</strong></p>
        <p>{{ $tourData['days'] ?? 0 }} Days Tour</p>
    </div>

    <div class="summary-box">
        <h3 style="margin-top:0;">Tour Summary</h3>
        @if(isset($tourData['departure']))
        <div class="summary-item">
            <span class="summary-label">From:</span> {{ $tourData['departure'] }}
        </div>
        @endif
        @if(isset($tourData['destination']))
        <div class="summary-item">
            <span class="summary-label">Destination:</span> {{ $tourData['destination'] }}
        </div>
        @endif
        @if(isset($tourData['days']))
        <div class="summary-item">
            <span class="summary-label">Duration:</span> {{ $tourData['days'] }} Days
        </div>
        @endif
        @if(isset($tourData['passengers']))
        <div class="summary-item">
            <span class="summary-label">Travelers:</span> {{ $tourData['passengers'] }} {{ $tourData['passengers'] > 1 ? 'People' : 'Person' }}
        </div>
        @endif
    </div>

    <h2>Daily Itinerary</h2>

    @if(isset($tourData['schedules']) && is_array($tourData['schedules']))
        @foreach($tourData['schedules'] as $schedule)
        <div class="day-section">
            <div class="day-header">
                <strong>Day {{ $schedule['day'] }}</strong>
                @if(isset($schedule['date']))
                    - {{ $schedule['date'] }}
                @endif
                <span style="float:right;">Day Cost: ${{ number_format($schedule['totalCost'], 2) }}</span>
            </div>

            @if(isset($schedule['items']) && is_array($schedule['items']))
                @foreach($schedule['items'] as $item)
                <div class="activity-item">
                    <div>
                        <span class="activity-time">{{ $item['startTime'] }} - {{ $item['endTime'] }}</span>
                        <span class="activity-type">{{ $item['type'] }}</span>
                        <span class="cost">${{ number_format($item['cost'], 2) }}</span>
                    </div>
                    <div style="margin-top: 5px;">
                        <strong>{{ $item['title'] }}</strong>
                    </div>
                    @if(isset($item['distance']))
                    <div style="font-size: 10px; color: #6b7280; margin-top: 3px;">
                        Distance: {{ $item['distance'] }}
                    </div>
                    @endif
                </div>
                @endforeach
            @endif
        </div>
        @endforeach
    @endif

    <div class="total-section">
        <p style="margin: 0 0 10px 0; font-size: 14px;">Total Tour Cost</p>
        <div class="total-amount">
            ${{ number_format($tourData['total_cost'] ?? 0, 2) }}
        </div>
    </div>

    <div class="footer">
        <p>Generated on {{ date('F j, Y \a\t g:i A') }}</p>
        <p>Smart Travel - Your Journey, Our Passion</p>
        <p>For questions, contact: support@smarttravel.com</p>
    </div>
</body>
</html>