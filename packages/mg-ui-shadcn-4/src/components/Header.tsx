import { cn } from '../lib/utils';
import { ModeToggle } from './mode-toggle';
import { PLFullBlock } from './PageLayout';
import { Button } from './ui/button';
import { TypographyLarge } from './ui/typography';

export interface HeaderPage {
    title: string;
    url: string;
}

export interface HeaderProps {
    title: string;
    pages: HeaderPage[];
    currentPage?: HeaderPage;
    onPageClick: (page: HeaderPage) => void;
    variant?: 'simple' | 'block';
    showModeToggle?: boolean;
    searchSlot?: React.ReactNode;
}

export function Header({
    title,
    pages,
    currentPage,
    onPageClick,
    variant = 'simple',
    showModeToggle = false,
    searchSlot,
}: HeaderProps) {
    const selectedPage = currentPage ?? pages[0];

    if (variant === 'block') {
        return (
            <PLFullBlock>
                <header className="flex w-full justify-between">
                    <section className="mr-auto">
                        <div className="px-3 py-1.5">{title}</div>
                    </section>
                    <section className="ml-auto flex gap-4">
                        {pages.map((page) => (
                            <button
                                type="button"
                                key={page.url}
                                onClick={() => onPageClick(page)}
                                className={cn(selectedPage === page && 'underline', 'hover:underline', 'px-3 py-1.5')}
                            >
                                {page.title}
                            </button>
                        ))}
                    </section>
                    <section className="px-3 pt-1">{showModeToggle && <ModeToggle />}</section>
                </header>
            </PLFullBlock>
        );
    }

    return (
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
            <TypographyLarge text={title} />
            {searchSlot && <div className="flex items-center">{searchSlot}</div>}
            <nav className="flex items-center gap-4">
                {pages.map((page) => (
                    <Button
                        variant="ghost"
                        key={page.url}
                        onClick={() => onPageClick(page)}
                        className={cn(selectedPage === page && 'underline')}
                    >
                        {page.title}
                    </Button>
                ))}
                {showModeToggle && <ModeToggle />}
            </nav>
        </header>
    );
}
