import Link from "next/link";

export default function RootNotFound() {
    return (
        <html lang="en">
            <body className="bg-background text-foreground">
                <div className="flex min-h-screen items-center justify-center p-4">
                    <div className="mx-auto max-w-md text-center space-y-4">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <span className="text-2xl font-bold text-muted-foreground">404</span>
                        </div>
                        <h1 className="text-2xl font-bold">Page not found</h1>
                        <p className="text-muted-foreground">
                            The page you are looking for does not exist or has been moved.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                        >
                            Go home
                        </Link>
                    </div>
                </div>
            </body>
        </html>
    );
}
