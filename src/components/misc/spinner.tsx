import { PiSpinnerBold } from 'react-icons/pi';

interface ISpinnerProps {
    size?: number;
    color?: string;
}

export default function Spinner({ size = 32, color = 'black' }: ISpinnerProps) {
    return (
        <>
            <PiSpinnerBold className="animate-spin" size={size} color={color} />
        </>
    );
}