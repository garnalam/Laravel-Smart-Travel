import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useLocalization } from '@/lib/localization'; // BƯỚC 1: Import hook mới

export default function Welcome() {
    // BƯỚC 2: Sử dụng hook mới để lấy hàm dịch thuật
    const { auth } = usePage<SharedData>().props;
    const __ = useLocalization();

    // Dữ liệu và phần còn lại của component không thay đổi
    const featuredTours = [
        {
            name: __('tours.hanoi.name'),
            location: __('tours.hanoi.location'),
            duration: __('tours.hanoi.duration'),
            price: '2.480',
            image:
                'https://marketplace.canva.com/wgNe8/MAFaRvwgNe8/1/tl/canva-hoan-kiem-lake-MAFaRvwgNe8.jpg',
        },
        {
            name: __('tours.danang.name'),
            location: __('tours.danang.location'),
            duration: __('tours.danang.duration'),
            price: '890',
            image:
                'https://media.vneconomy.vn/images/upload/2023/08/30/cau-vang-nag-tran-tuan-viet-5.jpg',
        },
        {
             name: __('tours.paris.name'),
            location: __('tours.paris.location'),
            duration: __('tours.paris.duration'),
            price: '3.950',
            image:
                'https://c4.wallpaperflare.com/wallpaper/150/935/583/paris-4k-download-beautiful-for-desktop-wallpaper-preview.jpg',
        },
    ];

    const signatureExperiences = [
        {
            title: __('experiences.flight_integration.title'),
            description: __('experiences.flight_integration.description'),
        },
        {
            title: __('experiences.smart_suggestion.title'),
            description: __('experiences.smart_suggestion.description'),
        },
        {
            title: __('experiences.detailed_itinerary.title'),
            description: __('experiences.detailed_itinerary.description'),
        },
        {
            title: __('experiences.budget_sync.title'),
            description: __('experiences.budget_sync.description'),
        },
    ];

    const travelStories = [
        {
            quote: __('stories.huong.quote'),
            author: __('stories.huong.author'),
        },
        {
            quote: __('stories.tan.quote'),
            author: __('stories.tan.author'),
        },
    ];
    
    const stats = [
        { label: __('stats.optimized_journeys'), value: '1.2K+' },
        { label: __('stats.satisfied_customers'), value: '98%' },
        { label: __('stats.partner_countries'), value: '36' },
    ];

    const planningSteps = [
        {
            title: __('steps.step1.title'),
            description: __('steps.step1.description'),
        },
        {
            title: __('steps.step2.title'),
            description: __('steps.step2.description'),
        },
        {
            title: __('steps.step3.title'),
            description: __('steps.step3.description'),
        },
    ];


    return (
        <>
            <Head title={__('welcome.meta_title')}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
                <script src="https://cdn.tailwindcss.com" />
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
:root { color-scheme: dark; }
@keyframes gradientShift {
    0% { transform: translate3d(-12%, -6%, 0) scale(1); filter: hue-rotate(0deg); }
    50% { transform: translate3d(10%, 6%, 0) scale(1.08); filter: hue-rotate(24deg); }
    100% { transform: translate3d(-14%, 12%, 0) scale(1); filter: hue-rotate(-12deg); }
}
@keyframes floatSlow {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-14px); }
}
@keyframes shimmerMove {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
@keyframes pulseOrbit {
    0% { transform: rotate(0deg) scale(0.95); opacity: 0.45; }
    50% { transform: rotate(180deg) scale(1.05); opacity: 0.75; }
    100% { transform: rotate(360deg) scale(0.95); opacity: 0.45; }
}
                        `,
                    }}
                />
            </Head>
            <div className="relative min-h-screen bg-gradient-to-br from-[#09131A] via-[#12303B] to-[#1A3D4B] text-[#F6F1E7]">
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                {/* Giữ lại ảnh nền và lớp màu xanh đen phủ lên */}
                <img
                    src=""
                    alt={__('welcome.background_alt')}
                    className="h-full w-full object-cover opacity-30 brightness-[1.08]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,24,31,0.92),rgba(14,31,41,0.55)_42%,rgba(26,61,75,0.75))]" />

                {/* Giữ lại các lớp nền tĩnh để tạo chiều sâu */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.16)_0%,_rgba(255,255,255,0)_70%)] mix-blend-overlay opacity-75" />
                <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0B1217] via-[#0B1217]/40 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:80px_80px] opacity-20" />
            </div>

                <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
                    <div className="flex items-center gap-3">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-[#7D837A]">
                                {__('welcome.header_brand')}
                            </p>
                            <p className="text-xl font-semibold text-[#F3F0E9]">
                                {__('welcome.header_subtitle')}
                            </p>
                        </div>
                    </div>
                    <nav className="flex items-center gap-4 text-sm font-medium">
                        <Link
                            href="#giai-doan"
                            className="rounded-full px-4 py-2 text-[#A5ABA3] transition hover:text-[#F3F0E9]"
                        >
                            {__('nav.experience')}
                        </Link>
                        <Link
                            href="#tour"
                            className="rounded-full px-4 py-2 text-[#A5ABA3] transition hover:text-[#F3F0E9]"
                        >
                            {__('nav.featured_tours')}
                        </Link>
                        <Link
                            href="#cau-chuyen"
                            className="rounded-full px-4 py-2 text-[#A5ABA3] transition hover:text-[#F3F0E9]"
                        >
                            {__('nav.stories')}
                        </Link>

                        {/* === BỘ CHUYỂN ĐỔI NGÔN NGỮ === */}
                        <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                            <Link href="/language/vi" className="rounded-md px-3 py-1 text-xs transition hover:bg-white/10">VI</Link>
                            <Link href="/language/en" className="rounded-md px-3 py-1 text-xs transition hover:bg-white/10">EN</Link>
                            <Link href="/language/ita" className="rounded-md px-3 py-1 text-xs transition hover:bg-white/10">ITA</Link>
                            <Link href="/language/chn" className="rounded-md px-3 py-1 text-xs transition hover:bg-white/10">CHN</Link>


                        </div>
                        {/* ================================= */}

                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="rounded-full bg-[#C4A77D] px-5 py-2 text-[#111418] transition hover:bg-[#d6b88b]"
                            >
                                {__('nav.dashboard')}
                            </Link>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href={login()}
                                    className="rounded-full px-4 py-2 text-[#A5ABA3] transition hover:text-[#F3F0E9]"
                                >
                                    {__('nav.login')}
                                </Link>
                                <Link
                                    href={register()}
                                    className="rounded-full bg-[#C4A77D] px-5 py-2 text-[#111418] transition hover:bg-[#d6b88b]"
                                >
                                    {__('nav.get_started')}
                                </Link>
                            </div>
                        )}
                    </nav>
                </header>

                <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-24">
                    <section className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-center">
                        <div className="space-y-8">
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#C4A77D]/70 bg-[#1A242C] px-4 py-2 text-xs font-medium uppercase tracking-[0.35em] text-[#C4A77D] whitespace-nowrap">
                                {__('hero.platform_intro')}
                            </span>
                            <h1 className="text-4xl font-semibold leading-tight text-[#F3F0E9] sm:text-5xl">
                                {__('hero.main_title')}
                            </h1>
                            <p className="max-w-xl text-base leading-relaxed text-[#A5ABA3]">
                                {__('hero.description')}
                            </p>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {stats.map((stat, index) => (
                                    <div
                                        key={stat.label}
                                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:border-[#FFE5B4]/40"
                                        style={{ animation: `floatSlow ${18 + index * 2}s ease-in-out infinite ${index * 1.2}s` }}
                                    >
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),transparent_60%)] opacity-60 transition group-hover:opacity-90" />
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent opacity-25 transition group-hover:opacity-50" />
                                        <p className="relative text-3xl font-semibold text-white drop-shadow-[0_10px_25px_rgba(255,199,128,0.35)]">
                                            {stat.value}
                                        </p>
                                        <p className="relative mt-1 text-xs uppercase tracking-[0.3em] text-[#D0D7D8]">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#C4A77D] px-6 py-3 text-sm font-semibold text-[#111418] transition hover:bg-[#d6b88b]"
                                >
                                    {__('hero.cta_create_profile')}
                                    <span aria-hidden>→</span>
                                </Link>
                                <Link
                                    href="#tour"
                                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-[#F3F0E9] transition hover:border-white/30"
                                >
                                    {__('hero.cta_view_tours')}
                                </Link>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-3 rounded-[2.2rem] bg-gradient-to-br from-[#FFE4C4]/40 via-transparent to-transparent blur-[70px]" />
                            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#15212A]/85 p-6 backdrop-blur transition duration-500 hover:border-[#FFE5B4]/40 hover:shadow-[0_32px_80px_-20px_rgba(255,201,138,0.35)]">
                                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/12 to-transparent" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,232,190,0.35),transparent_60%)] opacity-60" />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.4em] text-[#7D837A] whitespace-nowrap">
                                            {__('planner.brand')}
                                        </p>
                                        <p className="mt-2 text-xl font-semibold text-[#F3F0E9] whitespace-nowrap">
                                            {__('planner.title')}
                                        </p>
                                    </div>
                                    {/* <span className="rounded-full bg-[#C4A77D]/20 px-3 py-1 text-xs font-semibold text-[#C4A77D] whitespace-nowrap">
                                        {__('planner.tag')}
                                    </span> */}
                                </div>
                                <div className="mt-6 space-y-4">
                                    {featuredTours.map((tour, index) => (
                                        <article
                                            key={tour.name}
                                            className="group flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition duration-500 hover:border-[#FFE5B4]/50 hover:bg-white/8 hover:shadow-[0_20px_60px_-25px_rgba(255,199,128,0.45)]"
                                            style={{ animation: `floatSlow ${16 + index * 1.5}s ease-in-out infinite ${index * 0.8}s` }}
                                        >
                                            <div className="relative h-20 w-24 overflow-hidden rounded-xl">
                                                <img
                                                    src={tour.image}
                                                    alt={tour.name}
                                                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
                                            </div>
                                            <div className="flex flex-1 flex-col justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-white drop-shadow-[0_10px_18px_rgba(0,0,0,0.32)]">
                                                        {tour.name}
                                                    </p>
                                                    <p className="text-xs text-[#D0D7D8]">{tour.location}</p>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-[#FFE5B4]">
                                                    <span>{tour.duration}</span>
                                                    {/* <span>{__('planner.price_from', {price: tour.price})}</span> */}
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                                <p className="mt-6 text-xs text-[#D0D7D8]">
                                    {__('planner.footer_note')}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section id="giai-doan" className="grid gap-6 rounded-[2.8rem] border border-white/10 bg-white/6 p-10 backdrop-blur-lg shadow-[0_55px_120px_-60px_rgba(0,0,0,0.6)]">
                        <div className="relative flex flex-wrap items-end justify-between gap-4">
                            <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-[#FFEBC9]/60 via-transparent to-transparent blur-[80px]" />
                            <div className="absolute -right-12 top-2 h-28 w-28 rounded-full bg-gradient-to-br from-[#97E8FF]/55 via-transparent to-transparent blur-[70px]" />
                            <div className="relative">
                                <h2 className="text-3xl font-semibold text-white drop-shadow-[0_12px_24px_rgba(255,199,128,0.45)]">
                                    {__('pillars.title')}
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm text-[#A5ABA3]">
                                    {__('pillars.description')}
                                </p>
                            </div>
                            <span className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-[#7D837A]">
                                {__('pillars.tag')}
                            </span>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            {signatureExperiences.map((item, index) => (
                                <div
                                    key={item.title}
                                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur transition duration-500 hover:border-[#FFE5B4]/45 hover:bg-white/10 hover:shadow-[0_30px_80px_-45px_rgba(255,199,128,0.55)]"
                                    style={{ animation: `floatSlow ${20 + index * 1.8}s ease-in-out infinite ${index * 1.1}s` }}
                                >
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_60%)] opacity-80 transition group-hover:opacity-100" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent" />
                                    <h3 className="relative text-lg font-semibold text-white drop-shadow-[0_12px_20px_rgba(0,0,0,0.32)] group-hover:text-[#FFE5B4]">
                                        {item.title}
                                    </h3>
                                    <p className="relative mt-3 text-sm text-[#D0D7D8]">{item.description}</p>
                                    <div className="absolute -right-12 -bottom-12 h-32 w-32 rounded-full bg-gradient-to-br from-[#FFEDCF]/40 via-transparent to-transparent blur-[70px]" />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="tour" className="space-y-8">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.4em] text-[#7D837A]">
                                    {__('personalized_tours.intro')}
                                </p>
                                <h2 className="mt-2 text-3xl font-semibold text-[#F3F0E9]">
                                    {__('personalized_tours.title')}
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm text-[#A5ABA3]">
                                    {__('personalized_tours.description')}
                                </p>
                            </div>
                            <Link
                                href={register()}
                                className="rounded-full border border-white/10 px-5 py-2 text-sm font-semibold text-[#F3F0E9] transition hover:border-[#C4A77D] hover:text-[#C4A77D]"
                            >
                                {__('personalized_tours.cta_advice')}
                            </Link>
                        </div>
                        <div className="grid gap-6 md:grid-cols-3">
                            {featuredTours.map((tour, index) => (
                                <article
                                    key={tour.name + tour.location}
                                    className="group relative flex h-full flex-col overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/7 transition duration-500 hover:border-[#FFE5B4]/45 hover:bg-white/10 hover:shadow-[0_32px_88px_-42px_rgba(255,199,128,0.6)]"
                                    style={{ animation: `floatSlow ${18 + index * 1.4}s ease-in-out infinite ${index * 0.9}s` }}
                                >
                                    <div className="relative h-44 w-full overflow-hidden">
                                        <img
                                            src={tour.image}
                                            alt={tour.name}
                                            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/55" />
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_50%)] opacity-70" />
                                    </div>
                                    <div className="flex flex-1 flex-col gap-5 p-6">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.3em] text-[#D0D7D8]">
                                                {tour.location}
                                            </p>
                                            <h3 className="mt-2 text-lg font-semibold text-white drop-shadow-[0_16px_20px_rgba(0,0,0,0.45)] group-hover:text-[#FFE5B4]">
                                                {tour.name}
                                            </h3>
                                        </div>
                                        <div className="mt-auto flex items-center justify-between text-sm text-[#FFE5B4]">
                                            <span>{tour.duration}</span>
                                            <span>{__('tours.price_from', { price: tour.price })}</span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section id="cau-chuyen" className="grid gap-8 rounded-[2.8rem] border border-white/10 bg-white/6 p-10 backdrop-blur-lg shadow-[0_55px_140px_-65px_rgba(0,0,0,0.65)] lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="h-[1px] w-12 bg-gradient-to-r from-[#FFE5B4] to-transparent" />
                                <p className="text-xs uppercase tracking-[0.4em] text-[#7D837A]">
                                    {__('voices.intro')}
                                </p>
                            </div>
                            <h2 className="text-3xl font-semibold text-[#F3F0E9]">
                                {__('voices.title')}
                            </h2>
                            <p className="text-sm text-[#A5ABA3]">
                                {__('voices.description')}
                            </p>
                            <div className="grid gap-4">
                                {travelStories.map((story, index) => (
                                    <blockquote
                                        key={story.author}
                                        className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur transition duration-500 hover:border-[#FFE5B4]/45 hover:bg-white/10 hover:shadow-[0_32px_90px_-46px_rgba(255,199,128,0.55)]"
                                        style={{ animation: `floatSlow ${24 + index * 2}s ease-in-out infinite ${index * 1.2}s` }}
                                    >
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_65%)] opacity-80" />
                                        <p className="relative text-base italic text-white drop-shadow-[0_14px_22px_rgba(0,0,0,0.35)]">“{story.quote}”</p>
                                        <footer className="relative mt-4 text-xs uppercase tracking-[0.3em] text-[#D0D7D8]">
                                            {story.author}
                                        </footer>
                                    </blockquote>
                                ))}
                            </div>
                        </div>
                        <div className="relative flex flex-col justify-between gap-6 rounded-[2.4rem] border border-white/10 bg-white/7 p-8 text-sm text-[#D0D7D8] backdrop-blur shadow-[0_40px_110px_-70px_rgba(0,0,0,0.65)] transition duration-500 hover:border-[#FFE5B4]/45 hover:bg-white/10">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_60%)] opacity-80" />
                            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-[#FFE5B4]/40 via-transparent to-transparent blur-[95px]" />
                            <div className="absolute -left-14 bottom-8 h-36 w-36 rounded-full bg-gradient-to-tr from-[#91E3FF]/35 via-transparent to-transparent blur-[85px]" />
                            <div className="relative">
                                <h3 className="text-xl font-semibold text-white drop-shadow-[0_16px_32px_rgba(0,0,0,0.4)]">
                                    {__('steps.title')}
                                </h3>
                                <ol className="mt-4 space-y-3 text-sm">
                                    {planningSteps.map((step, index) => (
                                        <li key={step.title} className="flex gap-3">
                                            <span className="mt-1 h-6 w-6 rounded-full border border-[#FFE5B4]/70 text-center text-xs leading-6 text-[#FFE5B4]">
                                                {index + 1}
                                            </span>
                                            <div>
                                                <p className="font-semibold text-white drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)]">
                                                    {step.title}
                                                </p>
                                                <p>{step.description}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                            <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/8 p-6 text-white shadow-[0_28px_80px_-45px_rgba(255,199,128,0.5)]">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.38),transparent_60%)] opacity-90" />
                                <p className="relative text-sm uppercase tracking-[0.35em] text-[#FFE5B4]">{__('member_perks.tag')}</p>
                                <p className="relative mt-2 text-2xl font-semibold text-white drop-shadow-[0_16px_32px_rgba(0,0,0,0.45)]">
                                    {__('member_perks.title')}
                                </p>
                                <p className="relative mt-2 text-sm text-[#F4F7F8]">
                                    {__('member_perks.description')}
                                </p>
                                <Link
                                    href={register()}
                                    className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-[#C4A77D] px-5 py-2 text-sm font-semibold text-[#111418] transition hover:bg-[#d6b88b]"
                                >
                                    {__('member_perks.cta_book')}
                                    <span aria-hidden className="transition group-hover:translate-x-1">
                                        →
                                    </span>
                                </Link>
                                <div className="pointer-events-none absolute -right-16 -bottom-14 h-40 w-40 rounded-full bg-gradient-to-br from-[#FFD7A0]/45 via-transparent to-transparent blur-[110px]" />
                                <div className="pointer-events-none absolute -left-14 -top-16 h-36 w-36 rounded-full bg-gradient-to-br from-[#FFE5B4]/40 via-transparent to-transparent blur-[90px]" />
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-white/10 bg-[#061017]/80 py-10 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 text-sm text-[#D0D7D8] sm:flex-row sm:items-center sm:justify-between">
                        <p className="drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]">{__('footer.copyright', { year: new Date().getFullYear() })}</p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="#" className="transition hover:text-[#FFE5B4]">
                                {__('footer.privacy_policy')}
                            </Link>
                            <Link href="#" className="transition hover:text-[#FFE5B4]">
                                {__('footer.terms_of_use')}
                            </Link>
                            <Link href="#" className="transition hover:text-[#FFE5B4]">
                                {__('footer.support_center')}
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

