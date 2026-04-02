import { Toaster as SonnerToaster } from 'sonner';

export const Toaster = () => {
    return (
        <SonnerToaster
            position="top-right"
            toastOptions={{
                style: {
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                },
                className: 'shadow-lg',
            }}
        />
    );
};
