import { motion } from "framer-motion";
import styles from "./CustomSwitch.module.css";

type Option = {
    value: string;
    label: string;
    disabled?: boolean;
};

type CustomSwitchProps = {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
};

export default function CustomSwitch({ options, value, onChange }: CustomSwitchProps) {
    return (
        <div className={styles.switchContainer} role="radiogroup">
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => !option.disabled && onChange(option.value)}
                    className={`${styles.switchOption} ${value === option.value ? styles.active : ""}`}
                    disabled={option.disabled}
                    role="radio"
                    aria-checked={value === option.value}
                >
                    {/* 선택된 옵션에만 하이라이터(배경)를 렌더링합니다. */}
                    {value === option.value && (
                        <motion.div
                            className={styles.highlighter}
                            // layoutId는 컴포넌트가 다른 위치에서 다시 렌더링될 때
                            // 부드럽게 이동하는 애니메이션을 만들어줍니다.
                            layoutId="highlighter"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                    <span className={styles.label}>{option.label}</span>
                </button>
            ))}
        </div>
    );
}