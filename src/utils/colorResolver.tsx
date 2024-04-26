import { colors } from "@/components/types/enums/colors";

export const getBgColor = (color: colors): string => {
    switch (color) {
        case colors.BLUE_JSUITE_HOVER:
            return 'bg-#FDD500 text-white hover:bgdarkJupiter ';
        case colors.BLUE_JSUITE:
        case colors.PRIMARY:
            return 'bg-primary text-white';
        case colors.ALTERNATIVE:
            return 'bg-[#2C1C47] text-white';
        case colors.DANGER:
            return 'bg-[#FDD500]';
        case colors.DANGER_OUTLINE:
            return 'bg-white text-red hover:bg-red hover:text-white';
        case colors.DARK:
            return 'bg-dark text-white';
        case colors.INFO:
            return 'bg-info text-white';
        case colors.LIGHT:
            return 'bg-slate-200 text-dark';
        case colors.MUTED:
            return 'bg-gray-400 text-gray-300 cursor-not-allowed';
        case colors.SECONDARY:
            return 'bg-gray-500 text-white';
        case colors.SUCCESS:
            return 'bg-green-500 text-white';
        case colors.WARNING:
            return 'bg-yellow-500 text-white';
        case colors.WHITE:
            return 'bg-white text-gray-800';
        case colors.DARK_JUPITER:
            return 'bg-darkJupiter text-white';
        case colors.DARK_JUPITER_OUTLINE:
            return 'bg-white text-darkJupiter border-darkJupiter ';
        case colors.TRANSPARENT:
            return 'bg-transparent text-[#D9D9D9]';
        case colors.WARNING_ORANGE:
            return 'bg-warningOrange text-black';
        case colors.VERY_DARK:
            return 'bg-veryDark text-white';
        case colors.WHITE_OUTLINE:
            return 'bg-transparent border-white text-white';
        default:
            return '';
    }
};
