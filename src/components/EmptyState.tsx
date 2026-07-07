interface EmptyStateProps {
    message?: string;
}

export default function EmptyState({
                                        message = 'No prompts yet. Create your first prompt to get started.',
                                    }: EmptyStateProps) {
    return (
        <div>
            <div>{message}</div>
        </div>
    );
}
