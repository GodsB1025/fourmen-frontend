import {
    type ContractRequest,
    type Field,
    type Recipient,
    type NotificationRecipient,
    type DocumentPayload
} from '../apis/Types';
import { type AllContractData } from '../types/contractForm'; // 2. 모든 폼 데이터 타입의 Union을 import 합니다.

// NOTE: 아래 두 타입은 별도의 파일(예: types.ts)에서 관리하거나,
// API 응답으로 받는 유저/수신자 정보 타입을 활용하는 것이 좋습니다.


// 계약을 전달받을 수신자의 정보
export interface RecipientInfo {
    name: string;
    email: string;
    phoneNumber: string; // '01012345678' 형식
}

// 서비스를 사용하는 유저(발신자)의 정보
export interface UserInfo {
    name: string;
    email: string;
    phoneNumber: string; // '01012345678' 형식
}

/**
 * createContractPayload 함수에 전달할 옵션 객체의 타입
 */
interface CreatePayloadOptions {
    formData: AllContractData;
    recipientInfo: RecipientInfo;
    userInfo: UserInfo;
    documentTitle: string;
    comment?: string; // 주석은 필수 아님
}

/**
 * 폼 데이터와 각종 정보를 바탕으로 API에 전송할 최종 Payload 객체를 생성합니다.
 * @param options - 페이로드 생성에 필요한 정보 객체
 * @returns {ContractRequest} API 전송 규격에 맞는 최종 객체
 */
export function createContractPayload(options: CreatePayloadOptions): ContractRequest {
    const { formData, recipientInfo, userInfo, documentTitle, comment } = options;

    // 1. 폼 데이터(객체)를 API가 요구하는 fields 배열 형태로 변환합니다.
    const fields: Field[] = Object.entries(formData).map(([key, value]) => ({
        id: key,
        value: String(value), // 모든 값을 문자열로 변환
    }));

    // 2. 수신자(Recipient) 정보를 구성합니다.
    const recipient: Recipient = {
        step_type: "01", // 고정값
        use_mail: true,  // 고정값
        use_sms: true,   // 고정값
        member: {
            name: recipientInfo.name,
            id: recipientInfo.email,
            sms: {
                country_code: "+82",
                phone_number: recipientInfo.phoneNumber,
            },
        },
        auth: {
            password: recipientInfo.phoneNumber.slice(-4), // 휴대폰 번호 뒤 4자리
            password_hint: "휴대폰번호 뒷자리를 입력해주세요.",
            valid: { day: 7, hour: 0 }, // 고정값
        },
    };

    // 3. 알림(Notification) 수신자 정보를 구성합니다. (계약 당사자 + 서비스 이용자)
    const notificationRecipients: NotificationRecipient[] = [
        // 계약 당사자
        {
            name: recipientInfo.name,
            email: recipientInfo.email,
            sms: {
                country_code: "+82",
                phone_number: recipientInfo.phoneNumber,
            },
            auth: {
                password: recipientInfo.phoneNumber.slice(-4),
                password_hint: "휴대폰번호 뒷자리를 입력해주세요.",
                mobile_verification: true,
                valid: { day: 7, hour: 0 }, // 고정값
            },
        },
        // 발신자
        {
            name: userInfo.name,
            email: userInfo.email,
            sms: {
                country_code: "+82",
                phone_number: userInfo.phoneNumber,
            },
            auth: {
                password: userInfo.phoneNumber.slice(-4),
                password_hint: "휴대폰번호 뒷자리를 입력해주세요.",
                mobile_verification: true,
                valid: { day: 7, hour: 0 }, // 고정값
            },
        },
    ];

    // 4. 모든 정보를 종합하여 최종 페이로드를 조립합니다.
    const documentPayload: DocumentPayload = {
        document_name: documentTitle,
        comment: comment || "서명 부탁드립니다.", // comment가 없으면 기본값 사용
        recipients: [recipient],
        fields: fields,
        select_group_name: "", // 고정값
        notification: notificationRecipients,
    };

    return {
        document: documentPayload,
    };
}