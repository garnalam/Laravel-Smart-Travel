import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { MapPin, Calendar, Users, DollarSign, CreditCard, Lock } from "lucide-react";
import '../../../css/payment.css'; // File CSS cho dropdown
import { router, useForm, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { useToast } from '@/hooks/useToast';
import { PageProps } from '@inertiajs/core';

// import { Navbar } from "@/components/common/Navbar";
interface TourInfo {
    id: string;
    name: string;
    destination: string;
    duration: number;
    participants: number;
    image: string;
    description: string;
    flight_cost: number;
}

interface PaymentFormData {
    fullName: string;
    email: string;
    phone: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    billingAddress: string;
}

export default function Home() {
    const { props } = usePage<PageProps & { tourData?: any }>();
    const { success, error } = useToast();
    const [formData, setFormData] = useState<PaymentFormData>({
        fullName: "",
        email: "",
        phone: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        billingAddress: "",
    });

    const [isProcessing, setIsProcessing] = useState(false);

    // Sample tour data
    const tour: TourInfo = {
        id: "tour-001",
        name: props.tourData?.departure,
        destination: props.tourData?.destination,
        duration: props.tourData?.days,
        participants: props.tourData?.passengers,
        flight_cost: (props.tourData?.flights?.selectedDepartureFlight?.price ?? 0) + (props.tourData?.flights?.selectedReturnFlight?.price ?? 0),
        image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Experience the tropical beauty of Bali with visits to ancient temples, stunning beaches, and traditional villages.",
    };

    const totalPrice = props.tourData?.days_cost.reduce((acc: number, curr: number) => acc + curr, 0) + tour.flight_cost;

    useEffect(() => {
        console.log('tourData', props);
    }, [props.tourData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn form submit mặc định

        const payload = {
            tour_id: props.tourData?.tour_id,
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.billingAddress,
        };
        
        router.post('/tour/payment', payload, {
            onSuccess: () => {
                success('Payment successful!');
            },
            onError: (errors) => {
                console.error('Error saving tour:', errors);
                error('Failed to save tour data');
            }
        });
        console.log(payload);
    };

    // chỉ cho số và cách nhau 4 số
    const formatCardNumber = (value: string) => {
        return value
            .replace(/[^0-9]/g, "")             // chỉ cho số
            .replace(/(.{4})/g, "$1 ")          // thêm khoảng trắng sau mỗi 4 số
            .trim();                            // loại bỏ khoảng trắng cuối cùng
    };

    const formatExpiryDate = (value: string) => {
        return value
            .replace(/\D/g, "")
            .replace(/(\d{2})(\d)/, "$1/$2")
            .substring(0, 5);
    };

    return (
        <>
        {/* <Navbar /> */}
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 text-gray-900">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Travel Payment</h1>
                    <p className="text-gray-600">Complete your booking securely</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Tour Information */}
                    <div className="space-y-6">
                        <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white">
                            <div className="h-64 overflow-hidden">
                                <img
                                    src={tour.image}
                                    alt={tour.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <CardHeader>
                                {/* <CardTitle className="text-2xl">{tour.name}</CardTitle> */}
                                <CardDescription className="flex items-center gap-2 text-base">
                                    <MapPin className="w-4 h-4" />
                                    {tour.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 ">
                                <p className="text-gray-600">{tour.description}</p>

                                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200 text-gray-900">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-indigo-600" />
                                        <div>
                                            <p className="text-sm text-gray-500">Duration</p>
                                            <p className="font-semibold">{tour.duration} Days</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-indigo-600" />
                                        <div>
                                            <p className="text-sm text-gray-500">Participants</p>
                                            <p className="font-semibold">{tour.participants} People</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 bg-gray-50 p-4 rounded-lg text-gray-900">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Flight Cost</span>
                                        <span className="font-semibold">${tour.flight_cost.toFixed(2)}</span>
                                    </div>
                                    {props.tourData?.days_cost.map((day_cost: number, index: number) => (
                                        <div key={index} className="flex justify-between items-center text-gray-900">
                                            <span className="text-gray-600">Cost of Day {index + 1}</span>
                                            <span className="font-semibold">${day_cost.toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center">
                                        <span className="font-semibold text-lg">Total Amount</span>
                                        <span className="text-2xl font-bold text-indigo-600 flex items-center gap-1">
                                            <DollarSign className="w-6 h-6" />
                                            {totalPrice.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                                    <Lock className="w-4 h-4" />
                                    <span>Your payment is secure and encrypted</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Payment Form */}
                    <div>
                        <Card className="shadow-lg bg-white text-gray-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Payment Information
                                </CardTitle>
                                <CardDescription className="text-gray-600">
                                    Enter your details to complete the booking
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form className="space-y-5" onSubmit={handleSubmit}>
                                    {/* Personal Information Section */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-900">Personal Information</h3>

                                        <div>
                                            <Label htmlFor="fullName" className="text-gray-700">
                                                Full Name
                                            </Label>
                                            <Input
                                                id="fullName"
                                                name="fullName"
                                                type="text"
                                                placeholder="John Doe"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="email" className="text-gray-700">
                                                Email Address
                                            </Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="phone" className="text-gray-700">
                                                Phone Number
                                            </Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                placeholder="+1 (555) 000-0000"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-4" />

                                    {/* Card Information Section */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-900">Card Information</h3>

                                        <div>
                                            <Label htmlFor="cardNumber" className="text-gray-700">
                                                Card Number
                                            </Label>
                                            <Input
                                                id="cardNumber"
                                                name="cardNumber"
                                                type="text"
                                                placeholder="1234 5678 9012 3456"
                                                value={formatCardNumber(formData.cardNumber)}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        cardNumber: e.target.value.replace(/\s/g, ""),
                                                    }))
                                                }
                                                maxLength={19}
                                                required
                                                className="mt-2 font-mono"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="expiryDate" className="text-gray-700">
                                                    Expiry Date
                                                </Label>
                                                <Input
                                                    id="expiryDate"
                                                    name="expiryDate"
                                                    type="text"
                                                    placeholder="MM/YY"
                                                    value={formData.expiryDate}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            expiryDate: formatExpiryDate(e.target.value),
                                                        }))
                                                    }
                                                    maxLength={5}
                                                    required
                                                    className="mt-2 font-mono"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="cvv" className="text-gray-700">
                                                    CVV
                                                </Label>
                                                <Input
                                                    id="cvv"
                                                    name="cvv"
                                                    type="text"
                                                    placeholder="123"
                                                    value={formData.cvv}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            cvv: e.target.value.replace(/\D/g, "").substring(0, 4),
                                                        }))
                                                    }
                                                    maxLength={4}
                                                    required
                                                    className="mt-2 font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-4" />

                                    {/* Billing Address Section */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-900">Billing Address</h3>

                                        <div>
                                            <Label htmlFor="billingAddress" className="text-gray-700">
                                                Address
                                            </Label>
                                            <Input
                                                id="billingAddress"
                                                name="billingAddress"
                                                type="text"
                                                placeholder="123 Main Street, City, State 12345"
                                                value={formData.billingAddress}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="border-t border-gray-200 pt-6">
                                        <Button
                                            type="submit"
                                            disabled={isProcessing}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors"
                                        >
                                            {isProcessing ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Processing Payment...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Lock className="w-4 h-4" />
                                                    Pay ${totalPrice.toFixed(2)}
                                                </span>
                                            )}
                                        </Button>
                                    </div>

                                    <p className="text-xs text-gray-500 text-center">
                                        By clicking "Pay", you agree to our terms and conditions. Your payment is secure and encrypted.
                                    </p>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

