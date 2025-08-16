import { FancySwitch } from '@omit/react-fancy-switch'
import './JoinMeetingContent.css'
import { useState } from 'react'
import styles from '../common/FancySwitch.module.css'

const JoinMeetingContent = () => {
    const [selectedOption, setSelectedOption] = useState<string | boolean>('my')

    const options = [
        { value: 'my', label: '내 회의', disabled: false },
        { value: 'company', label: '회사 회의', disabled: false },
    ]

    const handleChange = (value : string | boolean) => {
        setSelectedOption(value)
        // api 연결해서 

    }

    return (
        <>
            <FancySwitch
            options={options}
            value={selectedOption}
            onChange={handleChange}
            className={styles.switchContainer}
            radioClassName={styles.radioButton}
            highlighterClassName={styles.highlighter}
            />
            {/* <p>현재 선택된 값: {selectedOption}</p> */}
            <form>
                <label>참가 코드</label>
                <input type="text" style={{ width: '100%', padding: '8px', marginBottom: '12px' }} />
                <button type="submit">참가하기</button>
            </form>
        </>
    );
}

export default JoinMeetingContent