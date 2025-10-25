import React, { useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { CheckCircle, Calendar, MapPin, Users, DollarSign, Download, ArrowRight, Home, Mail, Phone, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import '../../../css/payment.css';
import { Navbar } from '../../components/common/Navbar';
import '../../../css/app.css'; // File CSS cho dropdown
interface PaymentData {
    id: string;
    user_id: number;
    tour_id: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    status: string;
    created_at: string;
    start_date: string;
}

interface TourData {
    departure?: string;
    destination?: string;
    days?: number;
    passengers?: number;
    total_cost?: number;
    flight_cost?: number;
    days_cost?: number[];
    start_date?: string;
}

export default function Success() {
    const { props } = usePage<{ paymentData?: PaymentData; tourData?: TourData }>();
    
    useEffect(() => {
        console.log('Success page data:', props);
    }, [props]);

    const paymentData = props.paymentData;
    const tourData = props.tourData;

    if (!paymentData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">No Payment Data Found</h1>
                    <p className="text-gray-600 mb-6">Please complete a payment first.</p>
                    <Button
                        onClick={() => router.visit('/tour/flight')}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Start New Tour
                    </Button>
                </div>
            </div>
        );
    }

    const bookingReference = `BK-${paymentData.id}-${Date.now().toString().slice(-6)}`;
    const totalCost = tourData?.total_cost || 0;

    const handleDownloadReceipt = () => {
        if (paymentData?.id) {
            window.location.href = `/tour/download-receipt?payment_id=${paymentData.id}`;
        } else {
            alert('Payment information not found');
        }
    };
    const handleDownload = () => {
        window.location.href = '/tour/download-itinerary';
    };
    const handleViewItinerary = () => {
        router.visit('/tour/final');
    };

    return (
        <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Success Animation Banner */}
                <div className="relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl shadow-2xl p-10 mb-8 text-white text-center animate-fade-in">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                    </div>
                    
                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-6 animate-bounce">
                            <CheckCircle className="w-16 h-16 text-white drop-shadow-lg" />
                        </div>
                        
                        <h1 className="text-5xl font-extrabold mb-4 drop-shadow-md">
                            Payment Successful!
                        </h1>
                        
                        <p className="text-2xl text-green-50 mb-6">
                            Your tour has been confirmed and booked
                        </p>
                        
                    </div>
                </div>

                {/* Confirmation Email Notice */}
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-8 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                Confirmation Email Sent
                            </h3>
                            <p className="text-gray-700">
                                A detailed confirmation has been sent to <span className="font-semibold text-blue-600">{paymentData.email}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Booking Details */}
                    <Card className="shadow-lg border-0 bg-white">
                        <CardHeader className="text-black">
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Booking Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <User className="w-5 h-5 text-indigo-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 mb-1">Full Name</p>
                                        <p className="font-semibold text-gray-900">{paymentData.fullName}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Mail className="w-5 h-5 text-indigo-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 mb-1">Email</p>
                                        <p className="font-semibold text-gray-900 break-all">{paymentData.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Phone className="w-5 h-5 text-indigo-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 mb-1">Phone</p>
                                        <p className="font-semibold text-gray-900">{paymentData.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <MapPin className="w-5 h-5 text-indigo-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 mb-1">Address</p>
                                        <p className="font-semibold text-gray-900">{paymentData.address}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tour Summary */}
                    <Card className="shadow-lg border-0 bg-white">
                        <CardHeader className="text-black">
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Tour Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {tourData && (
                                <div className="space-y-3">
                                    {tourData.departure && (
                                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                            <span className="text-gray-700 font-medium">From</span>
                                            <span className="font-bold text-gray-900">{tourData.departure}</span>
                                        </div>
                                    )}

                                    {tourData.destination && (
                                        <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                                            <span className="text-gray-700 font-medium flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                Destination
                                            </span>
                                            <span className="font-bold text-gray-900">{tourData.destination}</span>
                                        </div>
                                    )}
                                    {tourData.start_date && (
                                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                                            <span className="text-gray-700 font-medium flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Start Date
                                            </span>
                                            <span className="font-bold text-gray-900">{tourData.start_date}</span>
                                        </div>
                                    )}
                                    {tourData.days && (
                                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                            <span className="text-gray-700 font-medium flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Duration
                                            </span>
                                            <span className="font-bold text-gray-900">{tourData.days} Days</span>
                                        </div>
                                    )}

                                    {tourData.passengers && (
                                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                            <span className="text-gray-700 font-medium flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                Travelers
                                            </span>
                                            <span className="font-bold text-gray-900">{tourData.passengers} {tourData.passengers === 1 ? 'Person' : 'People'}</span>
                                        </div>
                                    )}

                                    <div className="border-t-2 border-gray-200 pt-3 mt-4">
                                        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                                            <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <DollarSign className="w-5 h-5 text-indigo-600" />
                                                Total Amount
                                            </span>
                                            <span className="text-3xl font-extrabold text-indigo-600">
                                                ${totalCost.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!tourData && (
                                <div className="text-center py-6 text-gray-500">
                                    Tour details not available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                        onClick={handleDownloadReceipt}
                        variant="outline"
                        className="h-auto py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Download className="w-6 h-6" />
                            <span className="font-semibold">Download Receipt</span>
                        </div>
                    </Button>

                    <Button
                        onClick={() => router.visit('/dashboard')}
                        variant="outline"
                        className="h-auto py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Home className="w-6 h-6" />
                            <span className="font-semibold">Back to Dashboard</span>
                        </div>
                    </Button>
                </div>

                {/* What's Next Section */}
                <Card className="mt-8 shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
                    <CardHeader>
                        <CardTitle className="text-2xl text-gray-900">What's Next?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                    1
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Check Your Email</h4>
                                    <p className="text-gray-600">We've sent a detailed confirmation with your booking reference and itinerary.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                    2
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Review Your Itinerary</h4>
                                    <p className="text-gray-600">Check all the details of your trip and download your travel documents.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                    3
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Prepare for Your Journey</h4>
                                    <p className="text-gray-600">Get ready for an amazing adventure! We'll send you reminders as your departure date approaches.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Message */}
                <div className="mt-8 text-center">
                    <p className="text-gray-600 text-sm">
                        Need help? Contact our support team at{' '}
                        <a href="mailto:support@smarttravel.com" className="text-blue-600 hover:text-blue-700 font-semibold">
                            support@smarttravel.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
        </>
    );
}

