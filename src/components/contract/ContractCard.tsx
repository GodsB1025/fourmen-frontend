// ALL/frontend/components/contract/ContractCard.tsx
import "./ContractCard.css"; // Import the new robust CSS
import type { Contract } from "../../apis/Types";

interface ContractCardProps {
    contract: Contract;
    handleClick: () => void;
}

const ContractCard = ({ contract, handleClick }: ContractCardProps) => {
    const baseURL = import.meta.env.VITE_API_BASE_URL as string;
    const imageUrl = `${baseURL}${contract.previewImageUrl}.png`;

    return (
        <div className="card-item">
            <div className="card-item__figure" onClick={handleClick}>
                <img src={imageUrl} alt={contract.templateName} className="card-item__image" />
            </div>
            <div className="card-item__body">
                <p className="card-item__title">{contract.templateName}</p>
            </div>
        </div>
    );
};

export default ContractCard;
