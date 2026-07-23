// TODO: Epic 3 — CSS-level theme system
// Theme registry will be implemented here.
// Each theme will provide a CSS class namespace and optional CSS file path.
// DataTable will accept a `theme` prop that switches CSS class bundles.

export type ThemeId = 'shadcn' | 'minimal';

export interface Theme {
    id: ThemeId;
    name: string;
    description: string;
}

export const themes: Record<ThemeId, Theme> = {
    shadcn: {
        id: 'shadcn',
        name: 'Shadcn',
        description: 'shadcn/ui styled table',
    },
    minimal: {
        id: 'minimal',
        name: 'Minimal',
        description: 'Minimal plain table style',
    },
};
