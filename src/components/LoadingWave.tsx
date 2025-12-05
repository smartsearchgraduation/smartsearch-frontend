interface LoadingWaveProps {
    message?: string;
}

const wrapperClass = "loading-wave-component";
const dotClass = "loading-wave-dot";

const LoadingWave = ({ message = "Loading results" }: LoadingWaveProps) => {
    return (
        <>
            <style>
                {`
                @keyframes bounce {
                    0%, 80%, 100% {
                        transform: translateY(0);
                        opacity: 0.5;
                    }
                    40% {
                        transform: translateY(-8px);
                        opacity: 1;
                    }
                }

                .${wrapperClass} {
                    text-align: center;
                    color: #555;
                    font-size: 1.1rem;
                }

                .${dotClass} {
                    display: inline-block;
                    width: 4px;
                    height: 4px;
                    background-color: currentColor;
                    border-radius: 50%;
                    margin-left: 2px;
                    
                    animation: bounce 1.3s infinite;
                }

                .${dotClass}:nth-of-type(2) {
                    animation-delay: 0.15s;
                }

                .${dotClass}:nth-of-type(3) {
                    animation-delay: 0.3s;
                }
                `}
            </style>

            <div role="status" className={wrapperClass}>
                {message}
                <span className={dotClass} />
                <span className={dotClass} />
                <span className={dotClass} />
            </div>
        </>
    );
};

export default LoadingWave;
