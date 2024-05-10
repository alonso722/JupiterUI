import { SVGProps } from 'react';
import { IconType } from 'react-icons';

export interface MenuItem {
    label: string;
    icon: IconType;
    to?: string;
    subItems?: SubItem[];
}

export interface SubItem {
    label: string;
    to: string;
}

export interface MenuItemClient {
    label: string;
    to?: string;
    subItems?: SubItem[];
}

// export interface MenuItemNew {
//     label: string;
//     icon: SVGProps<SVGSVGElement>;
//     to?: string;
//     subItems?: SubItem[];
// }
