import React from 'react';
import Image from 'next/image';
import Alert from './alert';
import { colors } from '../types/enums/colors';

interface SystemNotificationProps {
    message: string; // Nuevo prop para el mensaje personalizado
}

export default function SystemNotification({ message }: SystemNotificationProps) {
    return (
        <Alert color={colors.WARNING_ORANGE}>
            <div className="flex items-center justify-center gap-5">
                <Image
                    src="/icons/cone.png"
                    width={100}
                    height={100}
                    alt="Cono - Warning"
                />
                <div>
                    <p className="font-bold">
                        Lo sentimos, ha ocurrido un error.
                    </p>
                    <p className="font-bold">
                        Causa: <span className="italic">{message}</span> {/* Mostrar el mensaje personalizado */}
                    </p>
                </div>
            </div>
        </Alert>
    );
}
