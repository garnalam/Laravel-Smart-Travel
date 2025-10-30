<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payment Receipt - {{ $paymentData['id'] }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            color: #333;
            margin: 20px;
        }
        .header {
            text-align: center;
            padding: 15px 0;
            border-bottom: 3px solid #10b981;
            margin-bottom: 15px;
        }
        .header h1 {
            color: #10b981;
            margin: 0 0 5px 0;
            font-size: 20px;
        }
        .success-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 4px 12px;
            border-radius: 15px;
            margin-top: 8px;
            font-size: 10px;
        }
        .info-section {
            margin-bottom: 15px;
        }
        .info-section h3 {
            background: #f3f4f6;
            padding: 6px 8px;
            margin: 0 0 8px 0;
            border-left: 4px solid #2563eb;
            font-size: 13px;
        }
        .info-row {
            padding: 5px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-label {
            display: inline-block;
            width: 130px;
            font-weight: bold;
            color: #6b7280;
            font-size: 10px;
        }
        .total-box {
            background: #eff6ff;
            border: 2px solid #2563eb;
            border-radius: 6px;
            padding: 12px;
            text-align: center;
            margin: 15px 0;
        }
        .total-amount {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin: 8px 0;
        }
        
        /* Styles for itinerary section */
        .itinerary-section {
            margin-top: 15px;
        }
        .itinerary-header {
            color: #2563eb;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 6px;
            margin: 15px 0 10px 0;
            font-size: 15px;
        }
        .day-section {
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 8px;
            margin-bottom: 10px;
            background: #fafafa;
            /* Cho phép break nếu cần */
            page-break-inside: auto;
        }
        .day-header {
            background: #2563eb;
            color: white;
            padding: 6px 8px;
            border-radius: 4px;
            margin-bottom: 8px;
            font-size: 11px;
        }
        .activity-item {
            background: #ffffff;
            padding: 6px;
            margin-bottom: 4px;
            border-left: 3px solid #10b981;
            border-radius: 3px;
            page-break-inside: avoid; /* Giữ activity không bị cắt */
        }
        .activity-time {
            color: #2563eb;
            font-weight: bold;
            font-size: 10px;
        }
        .activity-type {
            display: inline-block;
            padding: 1px 5px;
            background: #dbeafe;
            border-radius: 3px;
            font-size: 8px;
            text-transform: uppercase;
            margin-left: 4px;
        }
        .activity-cost {
            float: right;
            font-weight: bold;
            color: #059669;
            font-size: 10px;
        }
        .activity-title {
            margin-top: 3px;
            font-weight: bold;
            font-size: 10px;
        }
        .activity-distance {
            font-size: 8px;
            color: #6b7280;
            margin-top: 2px;
        }
        
        .footer {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 9px;
            color: #6b7280;
        }
        
        /* Improve page flow */
        h2 {
            orphans: 3;
            widows: 3;
        }
        p {
            orphans: 2;
            widows: 2;
        }
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>✓ Payment Receipt</h1>
        <div class="success-badge">PAYMENT SUCCESSFUL</div>
        <p style="margin-top: 10px; font-size: 11px;">Booking Reference: <strong>BK-{{ $paymentData['id'] }}</strong></p>
    </div>

    <div class="info-section">
        <h3>Customer Information</h3>
        <div class="info-row">
            <span class="info-label">Full Name:</span>
            <span>{{ $paymentData['fullName'] }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Email:</span>
            <span>{{ $paymentData['email'] }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Phone:</span>
            <span>{{ $paymentData['phone'] }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Address:</span>
            <span>{{ $paymentData['address'] }}</span>
        </div>
    </div>

    @if(isset($tourData))
    <div class="info-section">
        <h3>Tour Details</h3>
        @if(isset($tourData['departure']))
        <div class="info-row">
            <span class="info-label">From:</span>
            <span>{{ $tourData['departure'] }}</span>
        </div>
        @endif
        @if(isset($tourData['destination']))
        <div class="info-row">
            <span class="info-label">Destination:</span>
            <span>{{ $tourData['destination'] }}</span>
        </div>
        @endif
        @if(isset($tourData['start_date']))
        <div class="info-row">
            <span class="info-label">Start Date:</span>
            <span>{{ $tourData['start_date'] }}</span>
        </div>
        @endif
        @if(isset($tourData['days']))
        <div class="info-row">
            <span class="info-label">Duration:</span>
            <span>{{ $tourData['days'] }} Days</span>
        </div>
        @endif
        @if(isset($tourData['passengers']))
        <div class="info-row">
            <span class="info-label">Travelers:</span>
            <span>{{ $tourData['passengers'] }} {{ $tourData['passengers'] > 1 ? 'People' : 'Person' }}</span>
        </div>
        @endif
    </div>
    @endif

    <div class="total-box">
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">Total Amount Paid</p>
        <div class="total-amount">
            ${{ number_format($tourData['total_cost'] ?? 0, 2) }}
        </div>
        <p style="margin: 8px 0 0 0; font-size: 10px; color: #6b7280;">Payment Status: <strong style="color: #10b981;">{{ strtoupper($paymentData['status']) }}</strong></p>
    </div>

    <div class="info-section">
        <h3>Payment Information</h3>
        <div class="info-row">
            <span class="info-label">Transaction ID:</span>
            <span>{{ $paymentData['id'] }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Payment Date:</span>
            <span>{{ $paymentData['created_at'] }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Payment Method:</span>
            <span>Credit Card</span>
        </div>
    </div>
    <div class="page-break"></div>
    {{-- Tour Itinerary Section - Removed page break for seamless flow --}}
    @if(isset($tourData['schedules']) && is_array($tourData['schedules']) && count($tourData['schedules']) > 0)
    <div class="itinerary-section">
        <h2 class="itinerary-header">
            📅 Your Tour Itinerary
        </h2>
        <p style="color: #6b7280; margin-bottom: 12px; font-size: 10px;">
            Detailed day-by-day schedule for your {{ $tourData['days'] ?? 0 }}-day tour
        </p>

        @foreach($tourData['schedules'] as $schedule)
        <div class="day-section">
            <div class="day-header">
                <strong>Day {{ $schedule['day'] }}</strong>
                <span style="float:right;">Day Cost: ${{ number_format($schedule['totalCost'], 2) }}</span>
            </div>

            @if(isset($schedule['items']) && is_array($schedule['items']))
                @foreach($schedule['items'] as $item)
                <div class="activity-item">
                    <div>
                        <span class="activity-time">{{ $item['startTime'] }} - {{ $item['endTime'] }}</span>
                        <span class="activity-type">{{ $item['type'] }}</span>
                        <span class="activity-cost">${{ number_format($item['cost'], 2) }}</span>
                    </div>
                    <div class="activity-title">
                        {{ $item['title'] }}
                    </div>
                    @if(isset($item['distance']))
                    <div class="activity-distance">
                        📍 Distance: {{ $item['distance'] }}
                    </div>
                    @endif
                    @if(isset($item['transport_mode']))
                    <div class="activity-distance">
                        🚗 Transport: {{ ucfirst($item['transport_mode']) }}
                    </div>
                    @endif
                </div>
                @endforeach
            @endif
        </div>
        @endforeach
    </div>
    @endif

    <div class="footer">
        <p><strong>Thank you for your booking!</strong></p>
        <p>This is an official receipt for your tour booking.</p>
        <p>Generated on {{ date('F j, Y \a\t g:i A') }}</p>
        <p style="margin-top: 8px;">Smart Travel - Your Journey, Our Passion</p>
        <p>For questions, contact: support@smarttravel.com | +1 (555) 123-4567</p>
    </div>
</body>
</html>