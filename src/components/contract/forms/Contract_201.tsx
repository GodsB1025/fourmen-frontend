import React, { useState } from 'react'
import { ContractTextInput } from '../../common/TextInput'
import type { ContractData_201, ContractFormProps } from '../../../types/contractForm';

const Contract_201: React.FC<ContractFormProps<ContractData_201>> = ({ data, onChange }) => {

    const styles = {
        inputDate : {
            display: "flex",
            gap: "1.5rem",
        }
    }

    return (
        <form>
            <div className="form-group">
                <label>근로자</label>
                <ContractTextInput
                type='text'
                value={data.근로자}
                onChange={(e)=>onChange({ 근로자: e.target.value })} // 변경된 부분만 포함하는 객체를 전달
                />
            </div>
            <div style={styles.inputDate}>
                <div className="form-group">
                    <label>시작 년</label>
                    <ContractTextInput
                    type='text'
                    value={data.시작년}
                    onChange={(e)=>onChange({ 시작년: e.target.value })} 
                    />
                </div>
                <div className="form-group">
                    <label>시작 월</label>
                    <ContractTextInput
                    type='text'
                    value={data.시작월}
                    onChange={(e)=>onChange({ 시작월: e.target.value })} 
                    />
                </div>
                <div className="form-group">
                    <label>시작 일</label>
                    <ContractTextInput
                    type='text'
                    value={data.시작일}
                    onChange={(e)=>onChange({ 시작일: e.target.value })} 
                    />
                </div>
            </div>
            <div style={styles.inputDate}>
                <div className="form-group">
                    <label>끝 년</label>
                    <ContractTextInput
                    type='text'
                    value={data.끝년}
                    onChange={(e)=>onChange({ 끝년: e.target.value })} 
                    />
                </div>
                <div className="form-group">
                    <label>끝 월</label>
                    <ContractTextInput
                    type='text'
                    value={data.끝월}
                    onChange={(e)=>onChange({ 끝월: e.target.value })} 
                    />
                </div>
                <div className="form-group">
                    <label>끝 일</label>
                    <ContractTextInput
                    type='text'
                    value={data.끝일}
                    onChange={(e)=>onChange({ 끝일: e.target.value })} 
                    />
                </div>
            </div>
            <div className="form-group">
                <label>업무 내용</label>
                <ContractTextInput
                type='text'
                value={data.업무내용}
                onChange={(e)=>onChange({ 업무내용: e.target.value })} 
                />
            </div>
            <div className="form-group">
                <label>월급</label>
                <ContractTextInput
                type='text'
                value={data.월급}
                onChange={(e)=>onChange({ 월급: e.target.value })} 
                />
            </div>
        </form>
    );
};

export default Contract_201