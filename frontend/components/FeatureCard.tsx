"use client";

import React from "react";
import { ArrowRight, LucideIcon } from "lucide-react";

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel: string;
    highlighted?: boolean;
    onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    highlighted = false,
    onClick
}) => {
    return (
        <div
            onClick={onClick}
            className="group flex flex-col justify-between bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer min-h-[220px]"
        >
            {/* Top Section */}
            <div>
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${highlighted
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                    }`}>
                    <Icon className="w-5 h-5" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-500 leading-relaxed">
                    {description}
                </p>
            </div>

            {/* Bottom Action */}
            <div className="mt-5 pt-4 border-t border-transparent group-hover:border-gray-100 transition-colors">
                <div className="flex items-center justify-between text-gray-700 text-sm font-medium px-3 py-2 rounded-lg group-hover:bg-gray-50 transition-colors">
                    <span>{actionLabel}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all" />
                </div>
            </div>
        </div>
    );
};

export default FeatureCard;
