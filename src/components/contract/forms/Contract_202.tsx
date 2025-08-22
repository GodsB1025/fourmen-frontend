import React, { useState } from 'react'
import { ContractTextInput } from '../../common/TextInput'
import type { ContractData_202, ContractFormProps } from '../../../types/contractForm';

const Contract_202: React.FC<ContractFormProps<ContractData_202>> = ({ data, onChange }) => {
    return (
        <form>
            <div className="form-group">
                <label>물품</label>
                <ContractTextInput
                type='text'
                value={data.item}
                onChange={(e)=>onChange({ item: e.target.value })} // 변경된 부분만 포함하는 객체를 전달
                />
            </div>
            <div className="form-group">
                <label>양</label>
                <ContractTextInput
                type='text'
                value={data.quantity}
                onChange={(e)=>onChange({ quantity: e.target.value })} // 변경된 부분만 포함하는 객체를 전달
                />
            </div>
        </form>
    );
};

export default Contract_202