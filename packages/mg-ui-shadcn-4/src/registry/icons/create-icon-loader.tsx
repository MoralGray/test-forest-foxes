/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ComponentType } from 'react';
import { use } from 'react';

// import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

const iconPromiseCaches = new Map<string, Map<string, Promise<unknown>>>();

function getCache(libraryName: string): Map<string, Promise<unknown>> {
    let cache = iconPromiseCaches.get(libraryName);
    if (!cache) {
        cache = new Map();
        iconPromiseCaches.set(libraryName, cache);
    }
    return cache;
}

// function isIconData(data: any): data is IconSvgElement {
//   return Array.isArray(data)
// }

export function createIconLoader(libraryName: string) {
    const cache = getCache(libraryName);

    return function IconLoader({
        name,
        strokeWidth = 2,
        ...props
    }: {
        name: string;
    } & React.ComponentProps<'svg'>) {
        if (!cache.has(name)) {
            const promise = import(`./__${libraryName}__.ts`).then((mod) => {
                const icon = mod[name as keyof typeof mod];
                return icon || null;
            });
            cache.set(name, promise);
        }

        const iconCache = cache.get(name);
        if (!iconCache) {
            return null;
        }
        const iconData = use(iconCache);

        if (!iconData) {
            return null;
        }

        // if (isIconData(iconData)) {
        //   return <HugeiconsIcon icon={iconData} strokeWidth={2} {...props} />
        // }

        const IconComponent = iconData as ComponentType;
        return <IconComponent {...props} />;
    };
}
