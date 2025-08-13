import './JoinMeetingContent.css'

const JoinMeetingContent = () => {
    return (
        <form>
            <label>참가 코드</label>
            <input type="text" style={{ width: '100%', padding: '8px', marginBottom: '12px' }} />
            <button type="submit">참가하기</button>
        </form>
    );
}

export default JoinMeetingContent