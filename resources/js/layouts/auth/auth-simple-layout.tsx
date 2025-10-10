import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#09131A] via-[#12303B] to-[#1A3D4B] p-6 text-[#F6F1E7] md:p-10">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,24,31,0.92),rgba(14,31,41,0.55) 42%,rgba(26,61,75,0.75))]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(248,217,174,0.4),transparent_55%),radial-gradient(circle_at_78%_18%,rgba(123,200,255,0.32),transparent_62%),radial-gradient(circle_at_40%_85%,rgba(255,170,170,0.32),transparent_58%)] mix-blend-screen opacity-90 [animation:gradientShift_22s_ease-in-out_infinite]" />
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_35%,rgba(255,255,255,0.16)_60%,rgba(255,255,255,0)_90%)] [background-size:260%] mix-blend-screen [animation:shimmerMove_26s_linear_infinite]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.12)_0%,_rgba(255,255,255,0)_70%)] mix-blend-overlay" />
                <div className="absolute -top-36 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#FFE8C8]/60 via-[#FFD0A4]/28 to-transparent blur-[140px] opacity-90 [animation:pulseOrbit_38s_linear_infinite]" />
                <div className="absolute bottom-[-18%] left-[-12%] h-[32rem] w-[32rem] rounded-full bg-gradient-to-tr from-[#7EE0FF]/32 via-[#3F9AD6]/22 to-transparent blur-[170px] opacity-80 [animation:pulseOrbit_44s_linear_infinite_reverse]" />
                <div className="absolute top-[24%] right-[-15%] h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-[#FFB8D0]/34 via-[#FFDAC2]/24 to-transparent blur-[150px] opacity-75 [animation:pulseOrbit_50s_linear_infinite]" />
                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:90px_90px] opacity-20" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="flex flex-col gap-8 rounded-[2.5rem] border border-white/10 bg-white/10 p-8 backdrop-blur-xl shadow-[0_40px_120px_-70px_rgba(0,0,0,0.65)]">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="relative mb-1 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white/10 backdrop-blur">
                                <AppLogoIcon className="size-10 fill-current text-[#FFE5B4]" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.4),transparent_60%)] mix-blend-screen" />
                            </div>
                            <span className="text-sm uppercase tracking-[0.35em] text-[#D0D7D8]">
                                Smart Travel
                            </span>
                        </Link>

                        <div className="space-y-3">
                            <h1 className="text-2xl font-semibold text-white drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
                                {title}
                            </h1>
                            <p className="text-sm text-[#D0D7D8] leading-relaxed">
                                {description}
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="pointer-events-none absolute -inset-3 rounded-[2.2rem] border border-white/10 opacity-40" />
                        <div className="pointer-events-none absolute -inset-6 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.18),transparent_70%)]" />
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
