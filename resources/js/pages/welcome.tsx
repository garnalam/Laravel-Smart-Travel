import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

const featuredTours = [
    {
        name: 'Hà Nội - Nghìn năm văn hiến ',
        location: 'Khám phá Hà Nội với những câu chuyện lịch sử hào hùng và nét đẹp văn hóa truyền thống.',
        duration: '5 ngày • 4 đêm',
        price: '2.480',
        image:
            'https://marketplace.canva.com/wgNe8/MAFaRvwgNe8/1/tl/canva-hoan-kiem-lake-MAFaRvwgNe8.jpg',
    },
    {
        name: 'Đà Nẵng – Thiên Đường Biển',
        location: 'Khám phá thành phố đáng sống với những bãi biển tuyệt đẹp, ẩm thực đa dạng và những cây cầu biểu tượng.',
        duration: '3 ngày • 2 đêm',
        price: '890',
        image:
            'https://media.vneconomy.vn/images/upload/2023/08/30/cau-vang-nag-tran-tuan-viet-5.jpg',
    },
    {
         name: 'Paris – Kinh Đô Ánh Sáng',
        location: 'Thành phố lãng mạn nhất thế giới với kiến trúc cổ kính, bảo tàng danh tiếng và những trải nghiệm ẩm thực tinh hoa.',
        duration: '7 ngày • 6 đêm',
        price: '3.950',
        image:
            'https://c4.wallpaperflare.com/wallpaper/150/935/583/paris-4k-download-beautiful-for-desktop-wallpaper-preview.jpg',
    },
];

const signatureExperiences = [
    {
        title: 'Tích hợp vé máy bay',
        description:
            'Chọn điểm đi/đến, ngày đi ngày về và nhận ngay gợi ý chuyến bay đi - về tối ưu chi phí.',
    },
    {
        title: 'Gợi ý địa điểm thông minh',
        description:
            'Thuật toán Smart Travel đề xuất thêm nhà hàng, khách sạn, điểm tham quan phù hợp với gu riêng.',
    },
    {
        title: 'Lộ trình chi tiết từng ngày',
        description:
            'Tự động sắp xếp thứ tự di chuyển, thời gian lưu trú và phương tiện trong ngày để không bỏ lỡ khoảnh khắc.',
    },
    {
        title: 'Đồng bộ ngân sách & nhóm',
        description:
            'Ước tính chi phí theo số người, đồng bộ với hội nhóm và cập nhật realtime khi thay đổi lựa chọn.',
    },
];

const travelStories = [
    {
        quote:
            'Smart Travel giúp tôi chọn vé máy bay phù hợp rồi tự động chèn thêm các địa điểm hợp gu – lịch trình 5 ngày gọn nhẹ và đúng sở thích.',
        author: 'Lan Hương • Hà Nội',
    },
    {
        quote:
            'Chỉ cần chọn thành phố và ngân sách, Smart Travel lo phần còn lại: bay, ăn, ở, chơi đều có đề xuất kèm thời gian biểu chi tiết.',
        author: 'Minh Tân • TP.HCM',
    },
];

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Smart Travel - Personalized Tour Planner">
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
                    <img
                        src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1800&q=80"
                        alt="Smart Travel background"
                        className="h-full w-full object-cover opacity-30 brightness-[1.08]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,24,31,0.92),rgba(14,31,41,0.55) 42%,rgba(26,61,75,0.75))]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(248,217,174,0.62),transparent_55%),radial-gradient(circle_at_78%_18%,rgba(123,200,255,0.45),transparent_60%),radial-gradient(circle_at_40%_85%,rgba(255,170,170,0.32),transparent_58%)] mix-blend-screen opacity-90 [animation:gradientShift_20s_ease-in-out_infinite]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.16)_0%,_rgba(255,255,255,0)_70%)] mix-blend-overlay opacity-75" />
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0)_35%,rgba(255,255,255,0.18)_60%,rgba(255,255,255,0)_90%)] [background-size:260%] mix-blend-screen [animation:shimmerMove_24s_linear_infinite]" />
                    <div
                        className="absolute -top-44 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#FFE8C8]/72 via-[#FFD0A4]/34 to-transparent blur-[150px]"
                        style={{ animation: 'pulseOrbit 32s linear infinite' }}
                    />
                    <div
                        className="absolute bottom-[-24%] left-[-10%] h-[33rem] w-[33rem] rounded-full bg-gradient-to-tr from-[#7EE0FF]/30 via-[#3F9AD6]/22 to-transparent blur-[170px]"
                        style={{ animation: 'pulseOrbit 36s linear infinite reverse' }}
                    />
                    <div
                        className="absolute top-[26%] right-[-18%] h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-[#FFB8D0]/32 via-[#FFDAC2]/24 to-transparent blur-[160px]"
                        style={{ animation: 'pulseOrbit 40s linear infinite' }}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0B1217] via-[#0B1217]/40 to-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:80px_80px] opacity-20" />
                </div>

                <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
                    <div className="flex items-center gap-3">
                        {/* <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#C4A77D]/15 text-lg font-semibold text-[#C4A77D]">
                            ST
                        </span> */}
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-[#7D837A]">
                                Smart Travel
                            </p>
                            <p className="text-xl font-semibold text-[#F3F0E9]">
                                Khám phá thế giới theo cách của bạn
                            </p>
                        </div>
                    </div>
                    <nav className="flex items-center gap-4 text-sm font-medium">
                        <Link
                            href="#giai-doan"
                            className="rounded-full px-4 py-2 text-[#A5ABA3] transition hover:text-[#F3F0E9]"
                        >
                            Trải nghiệm
                        </Link>
                        <Link
                            href="#tour"
                            className="rounded-full px-4 py-2 text-[#A5ABA3] transition hover:text-[#F3F0E9]"
                        >
                            Tour nổi bật
                        </Link>
                        <Link
                            href="#cau-chuyen"
                            className="rounded-full px-4 py-2 text-[#A5ABA3] transition hover:text-[#F3F0E9]"
                        >
                            Câu chuyện
                        </Link>
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="rounded-full bg-[#C4A77D] px-5 py-2 text-[#111418] transition hover:bg-[#d6b88b]"
                            >
                                Vào bảng điều khiển
                            </Link>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href={login()}
                                    className="rounded-full px-4 py-2 text-[#A5ABA3] transition hover:text-[#F3F0E9]"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    href={register()}
                                    className="rounded-full bg-[#C4A77D] px-5 py-2 text-[#111418] transition hover:bg-[#d6b88b]"
                                >
                                    Bắt đầu ngay
                                </Link>
                            </div>
                        )}
                    </nav>
                </header>

                <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-24">
                    <section className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-center">
                        <div className="space-y-8">
                            <span className="inline-flex items-center gap-2 rounded-full bg-[#1A242C] px-4 py-2 text-xs font-medium uppercase tracking-[0.35em] text-[#C4A77D]">
                               Platform Tour Recommendation đầu tiên tại Việt Nam
                            </span>
                            <h1 className="text-4xl font-semibold leading-tight text-[#F3F0E9] sm:text-5xl">
                                Lên lộ trình du lịch cá nhân hóa chỉ trong vài phút
                            </h1>
                            <p className="max-w-xl text-base leading-relaxed text-[#A5ABA3]">
                                Smart Travel giúp bạn tự thiết kế hành trình: chọn điểm đi/đến, book vé máy bay hai chiều, lựa chọn nhà hàng – khách sạn – địa điểm yêu thích và nhận ngay thời gian biểu tối ưu cho từng ngày.
                            </p>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {[
                                    { label: 'hành trình đã tối ưu', value: '1.2K+' },
                                    { label: 'hài lòng sau chuyến đi', value: '98%' },
                                    { label: 'quốc gia đối tác', value: '36' },
                                ].map((stat, index) => (
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
                                    Tạo hồ sơ du lịch
                                    <span aria-hidden>→</span>
                                </Link>
                                <Link
                                    href="#tour"
                                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-[#F3F0E9] transition hover:border-white/30"
                                >
                                    Xem tour đề xuất
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
                                        <p className="text-xs uppercase tracking-[0.4em] text-[#7D837A]">
                                            Smart Travel planner
                                        </p>
                                        <p className="mt-2 text-xl font-semibold text-[#F3F0E9]">
                                            Tổng quan hành trình đề xuất
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-[#C4A77D]/20 px-3 py-1 text-xs font-semibold text-[#C4A77D]">
                                        Cá nhân hóa
                                    </span>
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
                                                    <span>Ước tính từ ${tour.price}</span>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                                <p className="mt-6 text-xs text-[#D0D7D8]">
                                    Thuật toán Smart Travel AI cập nhật tình trạng chuyến bay, phòng lưu trú và tối ưu lịch trình từng ngày cho cả nhóm.
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
                                    Chất lượng hành trình được xây dựng tỉ mỉ từng chặng
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm text-[#A5ABA3]">
                                    Từ cảm hứng ban đầu đến dịch vụ hậu cần, chúng tôi kết hợp công nghệ dữ liệu, đối tác bản địa và đội ngũ travel designer tận tâm.
                                </p>
                            </div>
                            <span className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-[#7D837A]">
                                Four pillars
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
                                    Gợi ý từ Smart Travel AI
                                </p>
                                <h2 className="mt-2 text-3xl font-semibold text-[#F3F0E9]">
                                    Danh mục hành trình cá nhân hóa theo mục tiêu của bạn
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm text-[#A5ABA3]">
                                    Hệ thống phân tích ngân sách, số người và gu trải nghiệm để đề xuất tour, chuyến bay, khách sạn và hoạt động phù hợp – bạn chỉ việc tùy chỉnh và xác nhận.
                                </p>
                            </div>
                            <Link
                                href={register()}
                                className="rounded-full border border-white/10 px-5 py-2 text-sm font-semibold text-[#F3F0E9] transition hover:border-[#C4A77D] hover:text-[#C4A77D]"
                            >
                                Nhận tư vấn miễn phí
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
                                            <span>Chỉ từ ${tour.price}</span>
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
                                    Voices of Nomads
                                </p>
                            </div>
                            <h2 className="text-3xl font-semibold text-[#F3F0E9]">
                                Câu chuyện từ cộng đồng lữ khách của chúng tôi
                            </h2>
                            <p className="text-sm text-[#A5ABA3]">
                                Hơn 320.000 du khách đã tin dùng Smart Travel để đồng bộ vé bay, nơi ở, nhà hàng và lịch trình chi tiết cho mọi chuyến đi.
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
                                    Lên kế hoạch hành trình trong 3 bước
                                </h3>
                                <ol className="mt-4 space-y-3 text-sm">
                                    {[
                                        {
                                            title: 'Chọn thời gian & chuyến bay phù hợp',
                                            description:
                                                'Smart Travel gợi ý vé máy bay đi – về theo điểm xuất phát, ngày mong muốn và ngân sách nhóm.',
                                        },
                                        {
                                            title: 'Tick các địa điểm bạn yêu thích',
                                            description:
                                                'Chọn nhà hàng, khách sạn, địa danh, phương tiện yêu thích; hệ thống tự bổ sung gợi ý tinh gọn.',
                                        },
                                        {
                                            title: 'Nhận timeline n ngày và thanh toán',
                                            description:
                                                'Xem lịch trình từng ngày đã tối ưu di chuyển, thanh toán vé máy bay và sẵn sàng lên đường.',
                                        },
                                    ].map((step, index) => (
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
                                <p className="relative text-sm uppercase tracking-[0.35em] text-[#FFE5B4]">Đặc quyền thành viên</p>
                                <p className="relative mt-2 text-2xl font-semibold text-white drop-shadow-[0_16px_32px_rgba(0,0,0,0.45)]">
                                    Tư vấn travel designer 1:1
                                </p>
                                <p className="relative mt-2 text-sm text-[#F4F7F8]">
                                    Miễn phí buổi định hướng 45 phút với chuyên gia cho mọi hội viên mới đăng ký trong tháng này.
                                </p>
                                <Link
                                    href={register()}
                                    className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FFE5B4] to-[#FFD7A0] px-5 py-2 text-sm font-semibold text-[#2F2110] shadow-[0_15px_25px_-15px_rgba(255,170,80,0.75)] transition hover:scale-[1.03] hover:shadow-[0_22px_35px_-18px_rgba(255,170,80,0.85)]"
                                >
                                    Book lịch ngay
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
                        <p className="drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]">© {new Date().getFullYear()} Nomad Trails. Tất cả bản quyền được bảo lưu.</p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="#" className="transition hover:text-[#FFE5B4]">
                                Chính sách bảo mật
                            </Link>
                            <Link href="#" className="transition hover:text-[#FFE5B4]">
                                Điều khoản sử dụng
                            </Link>
                            <Link href="#" className="transition hover:text-[#FFE5B4]">
                                Trung tâm hỗ trợ
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
