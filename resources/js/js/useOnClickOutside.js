import { useEffect } from 'react';

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // Không làm gì nếu click vào chính ref hoặc các phần tử con của nó
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]); // Chạy lại effect nếu ref hoặc handler thay đổi
}

export default useOnClickOutside;