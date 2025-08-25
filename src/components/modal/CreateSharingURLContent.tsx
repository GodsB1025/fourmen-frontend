import React, { useEffect, useRef, useState } from 'react'
import './CreateSharingURLContent.css'
import Toast from '../common/Toast';
import { IconCopy } from '../../assets/icons';

interface SharingURLContentProps {
    sharingURL: string
}

const CreateSharingURLContent = ({ 
    sharingURL=""
}: SharingURLContentProps) => {
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isClicked, setIsClicked] = useState<boolean>(false);
    
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [url, setUrl] = useState<string | null>(sharingURL)

    const copyURL = async () => {
        setIsCopied(false); 

        try {
            // sharingURL 값을 클립보드에 복사
            await navigator.clipboard.writeText(url!);
            setIsCopied(true);

            setIsClicked(true);
            
            // 만약 이전 타이머가 있다면 초기화 (연속 클릭 시 대비)
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(() => {
                setIsClicked(false); // 1.5초 후에 클릭 상태를 false로 변경
            }, 1000);
        } catch (err : unknown) {
            let errorMessage = "URL 복사 실패"
            if(err instanceof Error) errorMessage += `: ${err.message}`
            setError(errorMessage)
        }
    };

    // 4. 컴포넌트가 사라질 때 타이머를 정리하여 메모리 누수 방지
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return (
        <div className='sharing-url-container'>
            <input
                className='sharing-url-input'
                type="text"
                value={sharingURL}
                readOnly
            />
            <button
                className={isClicked ? 'clicked' : ''}
                onClick={copyURL}
            >
                <IconCopy/>
            </button>

            {isCopied && (
                <Toast
                    message="URL을 복사했습니다." 
                    onClose={() => setIsCopied(false)}
                    type="success"
                />
            )}
            {error && (
                <Toast
                    message={error} 
                    onClose={() => setError(null)}
                    type="error"
                />
            )}
        </div>
    );
}

export default CreateSharingURLContent