import { useEffect, type RefObject } from 'react';

type Event = MouseEvent | TouchEvent;

export const useClickOutside = <T extends HTMLElement = HTMLElement>(
    ref: RefObject<T | null>,
    handler: (event: Event) => void,
) => {
    useEffect(() => {
        const listener = (event: Event) => {
            const el = ref.current;
            // ref.current가 없거나, 클릭된 영역이 ref.current 안에 포함될 경우 아무것도 하지 않음
            if (!el || el.contains((event?.target as Node) || null)) {
                return;
            }
            handler(event); // 핸들러(닫기 함수) 실행
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]); // ref나 handler가 변경될 때만 이펙트를 다시 실행
};