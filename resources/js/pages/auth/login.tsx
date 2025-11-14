import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import AuthLayout from '@/layouts/auth-layout'; // <-- ĐÃ XÓA
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useLocalization } from '@/lib/localization'; // Import hook dịch thuật

// === BƯỚC 1: THÊM 'useEffect' VÀ 'useRef' VÀO IMPORT ===
import React, { useEffect, useRef } from 'react'; 

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const __ = useLocalization(); // Khởi tạo hook dịch thuật

    // === BƯỚC 2: TẠO MỘT REF ===
    // ref này sẽ trỏ vào thẻ div bên ngoài cùng của trang Login
    const loginWrapperRef = useRef<HTMLDivElement>(null);

    // === BƯỚC 3: THÊM DEBUG BẰNG 'useEffect' ===
    useEffect(() => {
        // Effect này chỉ chạy 1 lần duy nhất khi component được mount
        console.log("--- DEBUG KHỞI TẠO TRANG LOGIN ---");
        
        if (loginWrapperRef.current) {
            // Lấy thẻ cha trực tiếp của component Login
            // Đây chính là thẻ mà Inertia render vào (thường là <div id="app">)
            const parentElement = loginWrapperRef.current.parentElement;

            console.log("DOM Parent của trang Login:", parentElement);
            
            // In ra toàn bộ HTML BÊN TRONG thẻ cha đó
            console.log(
                "HTML bên trong Parent (Tìm NavBar 'VietJourney' ở đây):", 
                parentElement?.innerHTML
            );
        }

        // In ra toàn bộ <body> để kiểm tra bên ngoài
        console.log("Toàn bộ <body> HTML (Kiểm tra bên ngoài <div id='app'>):", document.body.innerHTML);
        
        console.log("--- KẾT THÚC DEBUG ---");
    }, []); // Mảng rỗng [] đảm bảo nó chỉ chạy 1 lần

    return (
        // === BƯỚC 4: GẮN REF VÀO THẺ DIV BÊN NGOÀI CÙNG ===
        <div 
            ref={loginWrapperRef} // Gắn ref ở đây
            className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#09131A] via-[#12303B] to-[#1A3D4B] text-[#F6F1E7] overflow-hidden"
        >
            {/* Các lớp nền mờ ảo */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,24,31,0.92),rgba(14,31,41,0.55)_42%,rgba(26,61,75,0.75))]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.16)_0%,_rgba(255,255,255,0)_70%)] mix-blend-overlay opacity-75" />
                <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0B1217] via-[#0B1217]/40 to-transparent" />
            </div>
            {/* === KẾT THÚC LỚP NỀN === */}

            <Head title={__('login.meta_title')} />

            <div className="w-full max-w-lg z-10"> {/* Container căn giữa nội dung */}
                
                {/* Hiển thị thủ công Title và Description */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-semibold text-white drop-shadow-[0_18px_32px_rgba(0,0,0,0.4)]">
                        {__('login.welcome_back')}
                    </h1>
                    <p className="text-base text-[#A5ABA3] mt-2 max-w-md mx-auto">
                        {__('login.welcome_description')}
                    </p>
                </div>

                {/* Form đăng nhập (không thay đổi) */}
                <Form
                    {...AuthenticatedSessionController.store.form()}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-8"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-6">
                                <div className="rounded-3xl border border-white/15 bg-[rgba(10,25,33,0.9)] p-6 backdrop-blur-2xl shadow-[0_32px_110px_-60px_rgba(0,0,0,0.75)]">
                                    <div className="mb-6 space-y-2 text-center">
                                        <h2 className="text-lg font-semibold text-white drop-shadow-[0_18px_32px_rgba(0,0,0,0.4)]">
                                            {__('login.form.title')}
                                        </h2>
                                        <p className="text-sm text-[#D0D7D8]">
                                            {__('login.form.description')}
                                        </p>
                                    </div>

                                    <div className="grid gap-5">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email" className="text-sm uppercase tracking-[0.25em] text-[#FFE5B4]">
                                                {__('login.form.email_label')}
                                            </Label>
                                            <div className="relative">
                                                <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/20 opacity-65" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="email"
                                                    placeholder={__('login.form.email_placeholder')}
                                                    className="h-12 rounded-2xl border border-white/20 bg-[rgba(7,18,26,0.92)] text-white placeholder:text-[#B6C2C6] focus-visible:border-[#FFE5B4] focus-visible:ring-0"
                                                />
                                            </div>
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="grid gap-2">
                                            <div className="flex items-center">
                                                <Label htmlFor="password" className="text-sm uppercase tracking-[0.25em] text-[#FFE5B4]">
                                                    {__('login.form.password_label')}
                                                </Label>
                                                {canResetPassword && (
                                                    <TextLink
                                                        href={request()}
                                                        className="ml-auto text-xs text-[#7EE0FF] transition hover:text-[#FFE5B4]"
                                                        tabIndex={5}
                                                    >
                                                        {__('login.form.forgot_password')}
                                                    </TextLink>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/20 opacity-65" />
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    name="password"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="current-password"
                                                    placeholder="••••••••"
                                                    className="h-12 rounded-2xl border border-white/20 bg-[rgba(7,18,26,0.92)] text-white placeholder:text-[#B6C2C6] focus-visible:border-[#FFE5B4] focus-visible:ring-0"
                                                />
                                            </div>
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="flex items-center space-x-3 rounded-2xl border border-white/15 bg-[rgba(7,20,28,0.68)] p-3">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                tabIndex={3}
                                                className="border-[#FFE5B4]/70 text-[#FFE5B4]"
                                            />
                                            <Label htmlFor="remember" className="text-sm text-[#D0D7D8]">
                                                {__('login.form.remember_me')}
                                            </Label>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="group relative mt-1 h-12 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFEED0] via-[#FFD79E] to-[#FFB56D] text-sm font-semibold text-[#2B1200] shadow-[0_25px_70px_-20px_rgba(255,186,102,0.85)] transition-all hover:scale-[1.04] hover:shadow-[0_38px_98px_-30px_rgba(255,186,102,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEED0]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1820]"
                                            tabIndex={4}
                                            disabled={processing}
                                            data-test="login-button"
                                        >
                                            <span
                                                aria-hidden="true"
                                                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                            >
                                                <span className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(255,255,255,0.65),transparent_55%),radial-gradient(circle_at_85%_45%,rgba(255,255,255,0.5),transparent_60%)] mix-blend-screen" />
                                                <span className="absolute left-[-40%] top-1/2 h-[220%] w-[65%] -translate-y-1/2 rotate-[18deg] bg-white/70 blur-[60px] opacity-50" />
                                            </span>
                                            <span className="relative z-10 flex items-center justify-center gap-2 text-[1rem] font-semibold tracking-[0.03em] text-[#2B1200] drop-shadow-[0_10px_25px_rgba(255,225,190,0.6)]">
                                                {processing && (
                                                    <LoaderCircle className="h-4 w-4 animate-spin text-[#2B1200]" />
                                                )}
                                                {__('login.form.submit_button')}
                                            </span>
                                        </Button>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-white/15 bg-[rgba(8,23,31,0.75)] p-6 text-center text-sm text-[#D0D7D8] backdrop-blur-2xl shadow-[0_28px_90px_-55px_rgba(0,0,0,0.62)]">
                                    <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#FFE5B4]">
                                        {__('login.register.prompt_title')}
                                    </p>
                                    <p className="mb-4 text-sm">
                                        {__('login.register.prompt_description')}
                                    </p>
                                    <TextLink
                                        href={register()}
                                        tabIndex={5}
                                        className="inline-flex items-center gap-2 text-sm text-[#7EE0FF] transition hover:text-[#FFE5B4]"
                                    >
                                        {__('login.register.cta_button')}
                                        <span aria-hidden>→</span>
                                    </TextLink>
                                </div>
                            </div>
                        </>
                    )}
                </Form>

                {status && (
                    <div className="mt-8 text-center text-sm font-medium text-green-600"> {/* Thêm khoảng cách */}
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
}

// === DÒNG NÀY VẪN GIỮ NGUYÊN ===
// Báo cho Inertia rằng trang này không dùng layout (vì nó đã có layout riêng)
Login.layout = (page: React.ReactNode) => page;