import React from 'react'
import './ContractCard.css'
import type { Contract } from '../../apis/Types'

interface ContractCardProps {
    contract : Contract,
    handleClick : () => void
}

const ContractCard = ({
    contract,
    handleClick
}: ContractCardProps) => {
    const baseURL = import.meta.env.VITE_API_BASE_URL as string;
    return (
        <div
        className='contract-card-container'
        key={contract.templateId}
        onClick={()=>handleClick()}
        >
            <img 
            src={`${baseURL}${contract.previewImageUrl}.png`} 
            alt={contract.templateName} 
            />
            <p>{contract.templateName}</p>
        </div>
    )
}

export default ContractCard