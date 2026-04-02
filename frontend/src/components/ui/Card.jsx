export function Card({ title, right, children }) {
    return (
        <div className="bg-surface border border-divider rounded-2xl p-4">
            {(title || right) && (
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-medium text-primary">{title}</h2>
                    {right}
                </div>
            )}
            {children}
        </div>
    );
}