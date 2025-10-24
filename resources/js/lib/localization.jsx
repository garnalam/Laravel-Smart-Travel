import { usePage } from '@inertiajs/react';

/**
 * Hook tùy chỉnh để truy cập và xử lý các chuỗi dịch thuật.
 * Nó lấy dữ liệu `translations` từ props của Inertia và trả về một hàm
 * có chức năng tương tự như `__()` của Laravel.
 */
export function useLocalization() {
  const { translations } = usePage().props;

  /**
   * @param {string} key - Key dịch thuật (ví dụ: 'welcome.title')
   * @param {object} replacements - Các giá trị thay thế (ví dụ: { name: 'John' })
   * @returns {string} - Chuỗi đã được dịch
   */
  return (key, replacements = {}) => {
    // Lấy chuỗi dịch từ object, nếu không có thì trả về chính key đó
    let translation = translations[key] || key;

    // Thay thế các placeholder (ví dụ: :name) bằng giá trị thực tế
    Object.keys(replacements).forEach(r => {
      translation = translation.replace(`:${r}`, replacements[r]);
    });

    return translation;
  };
}
