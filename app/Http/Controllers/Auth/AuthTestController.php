<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthTestController extends Controller
{
    /**
     * Test API để kiểm tra password verification và authentication flow
     */
    public function testAuth(Request $request)
    {
        $email = $request->input('email', 'lamdubaiofficial1@gmail.com');
        $password = $request->input('password', '');
        
        $results = [
            'timestamp' => now()->toISOString(),
            'test_email' => $email,
            'tests' => []
        ];

        // Test 1: Tìm user trong database
        try {
            $user = User::where('email', $email)->first();
            $results['tests']['user_found'] = [
                'status' => $user ? 'SUCCESS' : 'FAILED',
                'message' => $user ? 'User found in database' : 'User not found in database',
                'user_id' => $user ? $user->_id : null,
                'user_data' => $user ? [
                    'email' => $user->email,
                    'full_name' => $user->full_name,
                    'has_password_hash' => !empty($user->password_hash),
                    'password_hash_length' => $user->password_hash ? strlen($user->password_hash) : 0,
                    'password_hash_prefix' => $user->password_hash ? substr($user->password_hash, 0, 10) . '...' : null,
                ] : null
            ];
        } catch (\Exception $e) {
            $results['tests']['user_found'] = [
                'status' => 'ERROR',
                'message' => 'Database error: ' . $e->getMessage()
            ];
        }

        // Test 2: Password verification nếu có user và password
        if (isset($user) && $user && !empty($password)) {
            try {
                // Test với Hash::check
                $hashCheck = Hash::check($password, $user->password_hash);
                $results['tests']['password_hash_check'] = [
                    'status' => $hashCheck ? 'SUCCESS' : 'FAILED',
                    'message' => $hashCheck ? 'Password hash verification successful' : 'Password hash verification failed',
                    'method' => 'Hash::check()'
                ];

                // Test với getAuthPassword method
                $authPassword = $user->getAuthPassword();
                $authCheck = Hash::check($password, $authPassword);
                $results['tests']['auth_password_check'] = [
                    'status' => $authCheck ? 'SUCCESS' : 'FAILED',
                    'message' => $authCheck ? 'Auth password verification successful' : 'Auth password verification failed',
                    'method' => 'getAuthPassword()',
                    'auth_password_equals_hash' => $authPassword === $user->password_hash
                ];

                // Test với Laravel Auth provider
                $providerCheck = Auth::getProvider()->validateCredentials($user, ['password' => $password]);
                $results['tests']['provider_validation'] = [
                    'status' => $providerCheck ? 'SUCCESS' : 'FAILED',
                    'message' => $providerCheck ? 'Laravel Auth provider validation successful' : 'Laravel Auth provider validation failed',
                    'method' => 'Auth::getProvider()->validateCredentials()'
                ];

            } catch (\Exception $e) {
                $results['tests']['password_verification'] = [
                    'status' => 'ERROR',
                    'message' => 'Password verification error: ' . $e->getMessage()
                ];
            }
        } else {
            $results['tests']['password_verification'] = [
                'status' => 'SKIPPED',
                'message' => 'Password not provided or user not found'
            ];
        }

        // Test 3: Auth configuration
        $results['tests']['auth_config'] = [
            'default_guard' => config('auth.defaults.guard'),
            'guard_driver' => config('auth.guards.web.driver'),
            'guard_provider' => config('auth.guards.web.provider'),
            'provider_driver' => config('auth.providers.users.driver'),
            'provider_model' => config('auth.providers.users.model'),
            'database_default' => config('database.default'),
        ];

        // Test 4: Route và middleware check
        $results['tests']['routes_check'] = [
            'dashboard_route_exists' => \Illuminate\Support\Facades\Route::has('dashboard'),
            'login_route_exists' => \Illuminate\Support\Facades\Route::has('login'),
            'home_route_exists' => \Illuminate\Support\Facades\Route::has('home'),
        ];

        // Test 5: Session configuration
        $results['tests']['session_config'] = [
            'session_driver' => config('session.driver'),
            'session_lifetime' => config('session.lifetime'),
            'session_encrypt' => config('session.encrypt'),
            'session_cookie' => config('session.cookie'),
        ];

        return response()->json($results, 200);
    }

    /**
     * Test login simulation
     */
    public function testLogin(Request $request)
    {
        $email = $request->input('email', 'lamdubaiofficial1@gmail.com');
        $password = $request->input('password', '');

        if (empty($password)) {
            return response()->json([
                'status' => 'ERROR',
                'message' => 'Password is required for login test'
            ], 400);
        }

        $results = [
            'timestamp' => now()->toISOString(),
            'test_email' => $email,
            'login_steps' => []
        ];

        try {
            // Step 1: Retrieve user
            $user = User::where('email', $email)->first();
            $results['login_steps']['step_1_user_retrieval'] = [
                'status' => $user ? 'SUCCESS' : 'FAILED',
                'message' => $user ? 'User retrieved successfully' : 'User not found'
            ];

            if (!$user) {
                return response()->json($results, 404);
            }

            // Step 2: Validate credentials
            $credentialsValid = Auth::getProvider()->validateCredentials($user, ['password' => $password]);
            $results['login_steps']['step_2_credential_validation'] = [
                'status' => $credentialsValid ? 'SUCCESS' : 'FAILED',
                'message' => $credentialsValid ? 'Credentials are valid' : 'Invalid credentials'
            ];

            if (!$credentialsValid) {
                return response()->json($results, 401);
            }

            // Step 3: Simulate login (without actually logging in)
            $results['login_steps']['step_3_login_simulation'] = [
                'status' => 'SUCCESS',
                'message' => 'Login would be successful',
                'redirect_options' => [
                    'dashboard_route' => \Illuminate\Support\Facades\Route::has('dashboard') ? route('dashboard') : null,
                    'home_route' => \Illuminate\Support\Facades\Route::has('home') ? route('home') : null,
                    'fallback' => '/dashboard'
                ]
            ];

            // Step 4: Check user permissions and status
            $results['login_steps']['step_4_user_status'] = [
                'is_verified' => $user->is_verified,
                'roles' => $user->roles,
                'status' => $user->system['status'] ?? 'unknown',
                'last_login' => $user->last_login,
            ];

            $results['overall_status'] = 'SUCCESS';
            $results['message'] = 'Login test completed successfully';

        } catch (\Exception $e) {
            $results['login_steps']['error'] = [
                'status' => 'ERROR',
                'message' => 'Login test failed: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ];
            $results['overall_status'] = 'ERROR';
        }

        return response()->json($results, 200);
    }

    /**
     * Test password hash generation
     */
    public function testPasswordHash(Request $request)
    {
        $password = $request->input('password', '');
        
        if (empty($password)) {
            return response()->json([
                'status' => 'ERROR',
                'message' => 'Password is required'
            ], 400);
        }

        $results = [
            'timestamp' => now()->toISOString(),
            'password_tests' => []
        ];

        // Test different hash methods
        $results['password_tests']['bcrypt_default'] = [
            'hash' => Hash::make($password),
            'method' => 'Hash::make() - default'
        ];

        $results['password_tests']['bcrypt_rounds_10'] = [
            'hash' => Hash::make($password, ['rounds' => 10]),
            'method' => 'Hash::make() - 10 rounds'
        ];

        $results['password_tests']['bcrypt_rounds_12'] = [
            'hash' => Hash::make($password, ['rounds' => 12]),
            'method' => 'Hash::make() - 12 rounds'
        ];

        // Test verification with existing hash from DB
        $user = User::where('email', 'lamdubaiofficial1@gmail.com')->first();
        if ($user && $user->password_hash) {
            $results['password_tests']['verify_existing_hash'] = [
                'status' => Hash::check($password, $user->password_hash) ? 'SUCCESS' : 'FAILED',
                'existing_hash' => $user->password_hash,
                'method' => 'Hash::check() with existing DB hash'
            ];
        }

        return response()->json($results, 200);
    }
}