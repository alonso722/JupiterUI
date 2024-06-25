import { MenuItem } from '../types/menu';
import paymentMethods from '../../../public/svg/icons/cardPay.svg';
import home from '../../../public/svg/icons/Home.svg';
import shopping from '../../../public/svg/icons/shopping.svg';

interface MenuItemEntity {
    home: MenuItem;
    shopping: MenuItem;
    paymentMethod: MenuItem;
}


export const allMenuItemsClient: MenuItemEntity = {
    home: {
        label: 'Inicio',
        icon: home,
        to: '/user',
    },
    shopping: {
        label: 'Mis compras',
        icon: shopping,
        to: '/user/purchases',
    },
    paymentMethod: {
        label: 'Mis métodos de pago',
        icon: paymentMethods,
        to: '/user/methods',
    },
};
