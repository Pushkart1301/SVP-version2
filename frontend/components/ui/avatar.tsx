"use client";

import React, { useState } from "react";
import { twMerge } from "tailwind-merge";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

export function Avatar({ className, children, ...props }: AvatarProps) {
    return (
        <div
            className={twMerge(
                "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> { }

export function AvatarImage({ className, src, alt, ...props }: AvatarImageProps) {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) return null;

    return (
        <img
            src={src}
            alt={alt}
            className={twMerge("aspect-square h-full w-full object-cover", className)}
            onError={() => setHasError(true)}
            {...props}
        />
    );
}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> { }

export function AvatarFallback({ className, children, ...props }: AvatarFallbackProps) {
    return (
        <div
            className={twMerge(
                "flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-slate-600 font-medium",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
