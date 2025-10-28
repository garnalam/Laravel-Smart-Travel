import '../../css/dashboard.css'
import { Navbar } from '../components/common/Navbar'
import { useAppStore } from '@/store/useAppStore'
import { SearchSection } from '@/components/common/SearchSection'
import { Footer } from '@/components/common/Footer'

export function JourneyGuideSection() {
  const { language } = useAppStore()

  const phases = [
    {
      title: language === 'vi' ? 'Xác định mục tiêu chuyến đi' : 'Clarify your travel goals',
      description:
        language === 'vi'
          ? 'Chọn đối tượng, cảm hứng và ngân sách để hệ thống hiểu rõ nhu cầu ban đầu.'
          : 'Choose traveller types, inspirations and budget so the system captures your core intent.',
      bullets: language === 'vi'
        ? ['Chia sẻ ai cùng đi và kỳ vọng trải nghiệm', 'Ưu tiên cảnh quan, ẩm thực hay văn hoá', 'Đặt khung ngân sách mong muốn']
        : ['Share who joins and expectations', 'Prioritise scenery, cuisine or culture', 'Set the target budget envelope'],
    },
    {
      title: language === 'vi' ? 'Điền chi tiết hành trình' : 'Provide itinerary details',
      description:
        language === 'vi'
          ? 'Ghi rõ điểm đi, điểm đến, ngày giờ và số lượng khách để tạo khung lịch trình.'
          : 'Specify departure, destinations, dates, and headcount to build the base schedule.',
      bullets: language === 'vi'
        ? ['Chọn tab dịch vụ phù hợp ở bước trên', 'Điền chính xác khung thời gian di chuyển', 'Tùy chọn thêm điểm dừng hoặc dịch vụ đi kèm']
        : ['Select the relevant service tab above', 'Provide precise travel window', 'Optionally add stopovers or add-on services'],
    },
    {
      title: language === 'vi' ? 'Nhận đề xuất & tinh chỉnh' : 'Receive and refine suggestions',
      description:
        language === 'vi'
          ? 'Xem gợi ý tự động từ hệ thống, điều chỉnh từng điểm đến, hoạt động, chỗ ở trước khi xác nhận.'
          : 'Review automated suggestions and tune destinations, activities, and stays before confirming.',
      bullets: language === 'vi'
        ? ['So sánh các lịch trình gợi ý', 'Kéo thả hoạt động ưu thích', 'Lưu hành trình đã cá nhân hoá để theo dõi']
        : ['Compare recommendation routes', 'Drag & drop preferred activities', 'Save personalised journeys for tracking'],
    },
  ]

  // Dữ liệu này đang không được sử dụng, bạn có thể xóa nếu muốn
  const timeline = [
    {
      label: language === 'vi' ? 'Chọn dịch vụ' : 'Pick a service',
      detail:
        language === 'vi'
          ? 'Tour cá nhân, khách sạn, vé máy bay, gói trọn hay dịch vụ ẩm thực.'
          : 'Personal tours, hotels, flights, bundles or culinary services.',
    },
    {
      label: language === 'vi' ? 'Nhập thông tin & gửi' : 'Fill details & submit',
      detail:
        language === 'vi'
          ? 'Bộ form thu thập điểm đến, thời gian, ngân sách, khách tham gia.'
          : 'Forms capture destination, schedule, budget and travel party.',
    },
    {
      label: language === 'vi' ? 'Xem kết quả đề xuất' : 'Review tailored proposals',
      detail:
        language === 'vi'
          ? 'Hệ thống trả về đề xuất phù hợp để bạn chỉnh sửa trong bảng điều khiển.'
          : 'System presents the tailored proposal ready for fine-tuning in the dashboard.',
    },
    {
      label: language === 'vi' ? 'Khóa lịch & đồng bộ' : 'Lock itinerary & sync',
      detail:
        language === 'vi'
          ? 'Xác nhận lịch cuối cùng, đồng bộ cùng đội ngũ hỗ trợ và chia sẻ cho khách.'
          : 'Confirm the final plan, sync with support teams and share with travellers.',
    },
  ]

  return (
    <section className="dashboard-journey" id="journey-guide">
      <div className="dashboard-journey__halo" aria-hidden="true" />
      <header className="dashboard-journey__header">
        <span className="dashboard-journey__tag">
          {language === 'vi' ? 'Quy trình cá nhân hóa tour' : 'Personalised tour workflow'}
        </span>
        <div className="dashboard-journey__titles">
          <h2>
            {language === 'vi'
              ? 'Từng bước tối ưu hành trình du lịch cho riêng bạn'
              : 'Step-by-step to optimise every personalised journey'}
          </h2>
          <p>
            {language === 'vi'
              ? 'Hoàn thành các bước dưới đây sau khi chọn dịch vụ tương ứng ở cụm tìm kiếm. Mọi thông tin được lưu trữ và đồng bộ trong một bảng điều khiển duy nhất để bạn tinh chỉnh dễ dàng.'
              : 'Complete the stages below once you choose a service in the curated builder. Every detail is stored in a single dashboard so you can refine with complete context.'}
          </p>
        </div>
      </header>

    {/* ===== THAY ĐỔI BẮT ĐẦU TỪ ĐÂY ===== */}
      <div className="dashboard-journey__content">
        
        {/* 1. Đã xóa div có class "dashboard-journey__column" */}
        
        {phases.map((phase, index) => (
          <article key={phase.title} className="dashboard-journey__milestone">
            <span className="dashboard-journey__milestone-index">{`0${index + 1}`}</span>
            <div className="dashboard-journey__milestone-body">
              <h3>{phase.title}</h3>
              <p>{phase.description}</p>
              <ul>
                  {phase.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            </article>
        ))}

      </div>
    {/* ===== THAY ĐỔI KẾT THÚC TẠI ĐÂY ===== */}
    </section>
  )
}

export default function DashboardPage() {
  const { language } = useAppStore()

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__background" aria-hidden="true" />
      <div className="dashboard-page__texture" aria-hidden="true" />

      <Navbar appearance="glass" />

      <main className="dashboard-main">
        <SearchSection />
        <JourneyGuideSection />
        <section id="dashboard-history" className="dashboard-history">
          <div className="dashboard-history__halo" aria-hidden="true" />
          <header className="dashboard-history__header">
            <span className="dashboard-history__tag">
              {language === 'vi' ? 'Nhật ký hành trình' : 'Journey archive'}
            </span>
            <div className="dashboard-history__titles">
              <h2>
                   {language === 'vi'
                  ? 'Lịch sử tìm kiếm tour gần đây'
                  : 'Recent tour search history'}
              </h2>
              <p>
                {language === 'vi'
                  ? 'Tất cả những lần cá nhân hóa gần nhất được chúng tôi lưu lại để bạn tiếp tục tối ưu và đặt chỗ nhanh.'
                  : 'Your latest personalisations preserved so you can refine or book with ease whenever inspiration strikes.'}
             </p>
            </div>
          </header>

          <div className="dashboard-history__grid">
            <article className="dashboard-history__item">
              <div className="dashboard-history__badge">
                <i className="fas fa-compass" aria-hidden="true" />
                {language === 'vi' ? 'Đã lưu' : 'Saved'}
              </div>
              <h3>{language === 'vi' ? 'Đà Lạt ngát xanh' : 'Emerald Da Lat Escape'}</h3>
              <ul>
                <li>
                  <span>{language === 'vi' ? 'Thời gian' : 'Dates'}</span>
                  <strong>12 – 16 Nov 2025</strong>
                </li>
                <li>
                  <span>{language === 'vi' ? 'Nhóm khách' : 'Travellers'}</span>
                  <strong>{language === 'vi' ? '2 người lớn, 1 trẻ em' : '2 adults · 1 child'}</strong>
                </li>
                <li>
                  <span>{language === 'vi' ? 'Ngân sách' : 'Budget'}</span>
                  <strong>$3,200</strong>
                </li>
              </ul>
              <button className="dashboard-history__action" type="button">
                <span>{language === 'vi' ? 'Xem lại lịch trình' : 'Review itinerary'}</span>
                <i className="fas fa-arrow-right" aria-hidden="true" />
              </button>
            </article>

            <article className="dashboard-history__item">
              <div className="dashboard-history__badge dashboard-history__badge--accent">
                <i className="fas fa-star" aria-hidden="true" />
                {language === 'vi' ? 'Đề xuất mới' : 'Fresh draft'}
              </div>
              <h3>{language === 'vi' ? 'Hạ Long du thuyền' : 'Ha Long Cruise Reverie'}</h3>
              <ul>
                <li>
                  <span>{language === 'vi' ? 'Thời gian' : 'Dates'}</span>
                  <strong>02 – 05 Dec 2025</strong>
                </li>
                <li>
                  <span>{language === 'vi' ? 'Nhóm khách' : 'Travellers'}</span>
                  <strong>{language === 'vi' ? '4 người lớn' : '4 adults'}</strong>
                </li>
                <li>
                  <span>{language === 'vi' ? 'Ngân sách' : 'Budget'}</span>
                <strong>$5,450</strong>
                </li>
              </ul>
              <button className="dashboard-history__action" type="button">
                <span>{language === 'vi' ? 'Tiếp tục cá nhân hóa' : 'Continue tailoring'}</span>
                <i className="fas fa-arrow-right" aria-hidden="true" />
              </button>
            </article>

            <article className="dashboard-history__item">
              <div className="dashboard-history__badge dashboard-history__badge--neutral">
                <i className="fas fa-history" aria-hidden="true" />
              {language === 'vi' ? 'Đã hoàn tất' : 'Completed'}
              </div>
              <h3>{language === 'vi' ? 'Huế hoài cổ' : 'Timeless Hue Retreat'}</h3>
            <ul>
                <li>
                  <span>{language === 'vi' ? 'Thời gian' : 'Dates'}</span>
                  <strong>25 – 29 Oct 2025</strong>
                </li>
                <li>
                 <span>{language === 'vi' ? 'Nhóm khách' : 'Travellers'}</span>
                  <strong>{language === 'vi' ? '2 người lớn' : '2 adults'}</strong>
                </li>
                <li>
                  <span>{language === 'vi' ? 'Ngân sách' : 'Budget'}</span>
                  <strong>$2,150</strong>
                </li>
              </ul>
              <button className="dashboard-history__action" type="button">
                <span>{language === 'vi' ? 'Chia sẻ hành trình' : 'Share itinerary'}</span>
                <i className="fas fa-arrow-right" aria-hidden="true" />            </button>
            </article>
          </div>
        </section>
      </main>
     <Footer />
    </div>
  )
}
