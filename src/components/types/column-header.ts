import { Column } from "@tanstack/react-table";
import { LLMModel } from "@/types/llm";

export interface ColumnHeaderProps {
    // Basic props (required)
    title: string;
    subtitle?: string;
    column: Column<LLMModel, unknown>;

    // Optional features
    tooltip?: string;          // Hover explanation
    link?: {                   // External link
        url: string;
        title: string;
    };
    filter?: {
        type: 'text' | 'range' | 'select' | 'boolean' | 'multi-select';  // Add multi-select type
        enabled: boolean;
        options?: string[];  // for select type
        showMin?: boolean;
        showMax?: boolean;
    };
    sort?: {                   // Sort configuration
        enabled: boolean;
        descFirst?: boolean;
    };
    draggable?: boolean;       // Show a subtle drag affordance
    verticalText?: boolean;    // Display header text vertically
}
