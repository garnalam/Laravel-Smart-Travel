import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    return (
        <AuthLayout
            title="Tạo tài khoản Smart Travel"
            description="Chỉ vài bước để trải nghiệm Smart Travel cùng chúng tôi."
        >
            <Head title="Register" />
            <Form
                {...RegisteredUserController.store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-8"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="rounded-3xl border border-white/15 bg-[rgba(10,25,33,0.9)] p-6 backdrop-blur-2xl shadow-[0_32px_110px_-60px_rgba(0,0,0,0.75)]">
                                <div className="mb-6 space-y-2 text-center">
                                    <h2 className="text-lg font-semibold text-white drop-shadow-[0_18px_32px_rgba(0,0,0,0.4)]">
                                        Hoàn thiện hồ sơ Smart Travel của bạn
                                    </h2>
                                    <p className="text-sm text-[#D0D7D8]">
                                        Tạo tài khoản để đồng bộ vé máy bay, lưu trữ địa điểm yêu thích và nhận lộ trình tối ưu hóa theo ngày.
                                    </p>
                                </div>

                                <div className="grid gap-5">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name" className="text-sm uppercase tracking-[0.25em] text-[#FFE5B4]">
                                            Họ tên
                                        </Label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/20 opacity-65" />
                                            <Input
                                                id="name"
                                                type="text"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="name"
                                                name="name"
                                                placeholder="Nguyễn Văn A"
                                                className="h-12 rounded-2xl border border-white/20 bg-[rgba(7,18,26,0.92)] text-white placeholder:text-[#B6C2C6] focus-visible:border-[#FFE5B4] focus-visible:ring-0"
                                            />
                                        </div>
                                        <InputError
                                            message={errors.name}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-sm uppercase tracking-[0.25em] text-[#FFE5B4]">
                                            Email
                                        </Label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/20 opacity-65" />
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                tabIndex={2}
                                                autoComplete="email"
                                                name="email"
                                                placeholder="smarttravel@email.com"
                                                className="h-12 rounded-2xl border border-white/20 bg-[rgba(7,18,26,0.92)] text-white placeholder:text-[#B6C2C6] focus-visible:border-[#FFE5B4] focus-visible:ring-0"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password" className="text-sm uppercase tracking-[0.25em] text-[#FFE5B4]">
                                            Mật khẩu
                                        </Label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/20 opacity-65" />
                                            <Input
                                                id="password"
                                                type="password"
                                                required
                                                tabIndex={3}
                                                autoComplete="new-password"
                                                name="password"
                                                placeholder="••••••••"
                                                className="h-12 rounded-2xl border border-white/20 bg-[rgba(7,18,26,0.92)] text-white placeholder:text-[#B6C2C6] focus-visible:border-[#FFE5B4] focus-visible:ring-0"
                                            />
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="password_confirmation"
                                            className="text-sm uppercase tracking-[0.25em] text-[#FFE5B4]"
                                        >
                                            Xác nhận mật khẩu
                                        </Label>
                                        <div className="relative">
                                            <div className="pointer-events-none.absolute inset-0 rounded-2xl border border-white/10 opacity-40" />
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                required
                                                tabIndex={4}
                                                autoComplete="new-password"
                                                name="password_confirmation"
                                                placeholder="••••••••"
                                                className="h-12 rounded-2xl border border-white/20 bg-[rgba(7,18,26,0.92)] text-white placeholder:text-[#B6C2C6] focus-visible:border-[#FFE5B4] focus-visible:ring-0"
                                            />
                                        </div>
                                        <InputError
                                            message={errors.password_confirmation}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="group relative mt-1 h-12 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFEED0] via-[#FFD79E] to-[#FFB56D] text-sm font-semibold text-[#2B1200] shadow-[0_25px_70px_-20px_rgba(255,186,102,0.85)] transition-all hover:scale-[1.04] hover:shadow-[0_38px_98px_-30px_rgba(255,186,102,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEED0]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1820]"
                                        tabIndex={5}
                                        data-test="register-user-button"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className="pointer-events-none absolute inset-0.opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                        >
                                            <span className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(255,255,255,0.65),transparent_55%),radial-gradient(circle_at_85%_45%,rgba(255,255,255,0.5),transparent_60%)] mix-blend-screen" />
                                            <span className="absolute left-[-40%] top-1/2 h-[220%] w-[65%] -translate-y-1/2 rotate-[18deg] bg-white/70 blur-[60px] opacity-50" />
                                        </span>
                                        <span className="relative z-10 flex items-center justify-center gap-2 text-[1rem] font-semibold tracking-[0.03em] text-[#2B1200] drop-shadow-[0_10px_25px_rgba(255,225,190,0.6)]">
                                            {processing && (
                                                <LoaderCircle className="h-4 w-4 animate-spin text-[#2B1200]" />
                                            )}
                                            Tạo tài khoản
                                        </span>
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/15 bg-[rgba(8,23,31,0.75)] p-6 text-center text-sm text-[#D0D7D8] backdrop-blur-2xl shadow-[0_28px_90px_-55px_rgba(0,0,0,0.62)]">
                                <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#FFE5B4]">
                                    Đã có tài khoản?
                                </p>
                                <p className="mb-4 text-sm">
                                    Đăng nhập để tiếp tục hành trình đã lưu, cập nhật vé bay và đồng bộ timeline từng ngày.
                                </p>
                                <TextLink
                                    href={login()}
                                    tabIndex={6}
                                    className="inline-flex items-center gap-2 text-sm text-[#7EE0FF] transition hover:text-[#FFE5B4]"
                                >
                                    Quay lại đăng nhập
                                    <span aria-hidden>→</span>
                                </TextLink>
                            </div>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
