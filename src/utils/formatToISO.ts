/**
 * date와 time 상태를 ISO 8601 형식의 UTC 문자열로 변환합니다.
 * 예: "2025-08-16T11:36:23.053Z"
 */
const formatToISO = (
    d: { year: string; month: string; day: string },
    t: { ampm: string; hour: string; minute: string }
): string => { 
    // 2자리 년도를 4자리로 변환 (예: '25' -> 2025)
    const fullYear = parseInt(`20${d.year}`, 10);
    const month = parseInt(d.month, 10) - 1; // Date 객체는 월을 0부터 시작
    const day = parseInt(d.day, 10);
    const minute = parseInt(t.minute, 10);

    // 12시간 형식을 24시간 형식으로 변환
    let hour = parseInt(t.hour, 10);
    if (t.ampm === 'PM' && hour < 12) {
        hour += 12;
    }
    if (t.ampm === 'AM' && hour === 12) { // 자정 (12 AM)
        hour = 0;
    }

    // 로컬 시간 기준으로 Date 객체 생성
    const localDate = new Date(fullYear, month, day, hour, minute);

    // UTC 기준 ISO 문자열로 변환하여 반환
    return localDate.toISOString(); // 수정: Date 객체 대신 ISO 문자열을 반환
};

export default formatToISO;