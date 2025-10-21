<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\PythonApiService;

class TestPythonApiConnection extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'python-api:test 
                            {--full : Run full test including recommendations}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test connection to Python API service';

    protected PythonApiService $pythonApi;

    /**
     * Create a new command instance.
     */
    public function __construct(PythonApiService $pythonApi)
    {
        parent::__construct();
        $this->pythonApi = $pythonApi;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔍 Testing Python API Connection...');
        $this->newLine();

        // Display configuration
        $this->displayConfiguration();
        $this->newLine();

        // Test 1: Health Check
        $this->info('📡 Test 1: Health Check');
        $this->line('──────────────────────────────────────');
        
        $healthResult = $this->pythonApi->healthCheck();
        
        if ($healthResult['success']) {
            $this->info('✅ Health Check: PASSED');
            
            if (isset($healthResult['data'])) {
                $data = $healthResult['data'];
                $this->line("   Status: {$data['status']}");
                $this->line("   Version: {$data['version']}");
                $this->line("   Timestamp: {$data['timestamp']}");
                
                if (isset($data['database'])) {
                    $dbStatus = $data['database']['success'] ? '✅ Connected' : '❌ Disconnected';
                    $this->line("   Database: {$dbStatus}");
                    
                    if (isset($data['database']['database'])) {
                        $this->line("   DB Name: {$data['database']['database']}");
                    }
                }
                
                if (isset($data['gemini_ai'])) {
                    $aiStatus = $data['gemini_ai']['configured'] ? '✅ Configured' : '❌ Not Configured';
                    $this->line("   Gemini AI: {$aiStatus}");
                }
            }
        } else {
            $this->error('❌ Health Check: FAILED');
            $this->error("   Error: {$healthResult['error']}");
            
            $this->newLine();
            $this->warn('💡 Troubleshooting Tips:');
            $this->line('   1. Make sure Python API is running');
            $this->line('   2. Check PYTHON_API_URL in .env file');
            $this->line('   3. Verify Python API is accessible');
            $this->line('   4. Check firewall/network settings');
            
            return Command::FAILURE;
        }

        $this->newLine();

        // Test 2: Get Cities (if health check passed)
        $this->info('📡 Test 2: Get Cities');
        $this->line('──────────────────────────────────────');
        
        $citiesResult = $this->pythonApi->getCities(5);
        
        if ($citiesResult['success']) {
            $this->info('✅ Get Cities: PASSED');
            $count = $citiesResult['count'] ?? count($citiesResult['cities'] ?? []);
            $this->line("   Cities Retrieved: {$count}");
            
            if (!empty($citiesResult['cities'])) {
                $this->line('   Sample Cities:');
                foreach (array_slice($citiesResult['cities'], 0, 3) as $city) {
                    $cityName = $city['name'] ?? 'Unknown';
                    $country = $city['country'] ?? 'Unknown';
                    $this->line("      • {$cityName}, {$country}");
                }
            }
        } else {
            $this->warn('⚠️  Get Cities: FAILED');
            $this->line("   Error: {$citiesResult['error']}");
            $this->line('   (This might be normal if you haven\'t set up the database yet)');
        }

        $this->newLine();

        // Test 3: Full Recommendation Test (optional)
        if ($this->option('full')) {
            $this->info('📡 Test 3: Get Recommendations (Full Test)');
            $this->line('──────────────────────────────────────');
            
            $this->line('Testing with sample data for Paris...');
            
            $recommendResult = $this->pythonApi->getRecommendationsByCityName(
                'Paris',
                2,  // guest_count
                3,  // duration_days
                2000.0  // budget
            );
            
            if ($recommendResult['success']) {
                $this->info('✅ Get Recommendations: PASSED');
                
                if (isset($recommendResult['data']['tour_info'])) {
                    $tourInfo = $recommendResult['data']['tour_info'];
                    $this->line("   Tour ID: {$tourInfo['tour_id']}");
                    $this->line("   Destination: {$tourInfo['destination_city']}");
                    $this->line("   Duration: {$tourInfo['duration_days']} days");
                    $this->line("   Budget: \${$tourInfo['budget']}");
                    $this->line("   Estimated Cost: \${$tourInfo['total_estimated_cost']}");
                }
                
                if (isset($recommendResult['data']['summary'])) {
                    $summary = $recommendResult['data']['summary'];
                    $this->line("   Total Activities: {$summary['total_activities']}");
                    $this->line("   Budget Utilized: " . number_format($summary['budget_utilized'], 2) . "%");
                }
            } else {
                $this->warn('⚠️  Get Recommendations: FAILED');
                $this->line("   Error: {$recommendResult['error']}");
            }
            
            $this->newLine();
        }

        // Final Summary
        $this->info('═══════════════════════════════════════');
        $this->info('🎉 Connection Test Complete!');
        $this->info('═══════════════════════════════════════');
        
        if ($healthResult['success']) {
            $this->newLine();
            $this->info('✅ Your Laravel application can communicate with Python API successfully!');
            
            if (!$this->option('full')) {
                $this->newLine();
                $this->comment('💡 Tip: Run with --full flag to test the recommendation endpoint:');
                $this->line('   php artisan python-api:test --full');
            }
        }

        return Command::SUCCESS;
    }

    /**
     * Display current configuration
     */
    protected function displayConfiguration(): void
    {
        $this->info('⚙️  Current Configuration:');
        $this->line('──────────────────────────────────────');
        $this->line('   Python API URL: ' . config('services.python_api.url'));
        $this->line('   Timeout: ' . config('services.python_api.timeout') . 's');
        $apiKey = config('services.python_api.api_key');
        $this->line('   API Key: ' . ($apiKey ? '***' . substr($apiKey, -4) : 'Not Set'));
    }
}

