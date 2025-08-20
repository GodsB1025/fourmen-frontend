import React from 'react';
import './ContractContent.css'; // 스타일을 위한 CSS 파일을 import 합니다.
import Contract_202 from '../contract/forms/contract_202';

const submitContract = async () => {
    // 계약서를 전달할 로직
}

const ContractContent: React.FC = () => {
    return (
        <div className="contract-container">
            {/* 왼쪽 폼 섹션 */}
            <div className="form-section">
                <h2>계약서 내용</h2>
                <div>
                    <Contract_202 />
                </div>
                <div>
                    <button
                    onClick={submitContract}
                    > 전송 </button>
                </div>
            </div>

            {/* 오른쪽 회의록 섹션 */}
            <div className="content-section">
                <h2>회의록_제목1</h2>
                <div className="content-body">
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                        Suspendisse quis ipsum placerat, sollicitudin eu, cursus arcu. 
                        Suspendisse pulvinar consectetuer vitae rhoncus. Praesent ante metus, 
                        efficitur at magna vitae, elementum ac velit. Donec justo elit, 
                        varius molestie at, venenatis non eros. Phasellus dignissim auctor porta. 
                        Proin commodo eget ligula in fermentum. Quisque elementum vestibulum condimentum.
                    </p>
                    <p>
                        Interdum et malesuada fames ac ante ipsum primis in faucibus. 
                        Suspendisse vitae enim a diam pulvinar dapibus. Sed posuere dictum turpis, 
                        feugiat efficitur leo viverra ut. Mauris suscipit scelerisque lectus, 
                        at molestie feugiat sem congue ut. Pellentesque curabitur tellus in justo lobortis iaculis.
                    </p>
                    <p>
                        Mauris sodales, metus et pharetra condimentum, nisl nisi scelerisque ante, 
                        eget vestibulum eros justo et justo. Curabitur nec feugiat lorem. 
                        Aliquam accumsan turpis nibh, vel mattis lacus tempus eu. 
                        Suspendisse sed ullamcorper augue, vitae pretium mauris.
                    </p>
                    <p>
                        Pellentesque nec turpis sodales, fringilla turpis sed, ultrices ex. 
                        Suspendisse id augue quis nibh pulvinar cursus. Duis pharetra commodo urna, 
                        in mollis orci iaculis in. Vestibulum pharetra tincidunt ligula. 
                        Fusce tristique convallis nisl, id finibus enim dignissim non. 
                        Nulla a blandit ante. Fusce cursus, purus non bibendum congue, dui velit dignissim risus, 
                        ut consectetur ex massa quis ex. Nunc ac dolor pharetra, bibendum eros sagittis, 
                        vulputate orci. Donec gravida.
                    </p>
                </div>
            </div>
            {/* 참고: 이미지의 빨간색 X 버튼은 일반적으로 부모 Modal 컴포넌트에서 관리합니다. */}
        </div>
    );
};

export default ContractContent;