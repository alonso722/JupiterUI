interface FormErrorProps {
    error?: string | null;
}

export default function FormError ( { error } : FormErrorProps ) {
    return <>
        { error && error?.length > 0 && <p className='text-red'>
            {error}
        </p>}
    </>
}