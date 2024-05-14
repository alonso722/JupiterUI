import { useState } from 'react';
import { Transition } from '@headlessui/react';

export default function DropdownMenu() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative w-[100px] inline-block text-left top-[88px] left-[50px]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="inline-flex justify-center w-full px-4 py-2 rounded-lg outline outline-1  shadow-2xl shadow-violet-950"
                id="options-menu"
                aria-haspopup="true"
                aria-expanded="true">
                Menu
            </button>

            <Transition
                show={isOpen}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95">
                <div className="absolute top-full right-0 mt-1 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg shadow-violet-950">
                    <div className="py-1">
                        <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem">
                            Opción 1
                        </a>
                        <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem">
                            Opción 2
                        </a>
                        <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem">
                            Opción 3
                        </a>
                    </div>
                </div>
            </Transition>
        </div>
    );
}
