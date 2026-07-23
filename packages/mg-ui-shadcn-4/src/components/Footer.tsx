import { PLFullBlock } from './PageLayout';
import { Button } from './ui/button';
import { Github, Globe, Send, Twitter } from 'lucide-react';

export interface FooterProps {
    variant?: 'simple' | 'block';
}

export function Footer({ variant = 'simple' }: FooterProps) {
    const content = (
        <div className="flex w-full items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">MGINC</span>
            <div className="flex gap-2">
                <Button variant="outline" size="icon" aria-label="GosContent site">
                    <Globe className="size-4" />
                </Button>
                <Button variant="outline" size="icon" aria-label="Telegram">
                    <Send className="size-4" />
                </Button>
                <Button variant="outline" size="icon" aria-label="Github">
                    <Github className="size-4" />
                </Button>
                <Button variant="outline" size="icon" aria-label="Twitter">
                    <Twitter className="size-4" />
                </Button>
            </div>
        </div>
    );

    if (variant === 'block') {
        return <PLFullBlock>{content}</PLFullBlock>;
    }

    return <footer className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">{content}</footer>;
}
