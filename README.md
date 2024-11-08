# The-Filler-Inner
Obsidian Plugin that takes available template and fills it in using AI.

src/
├── main.ts                     # Plugin entry point
├── types/                      # Type definitions
│   ├── index.ts               # Export all types
│   └── settings.ts            # Settings interface
├── components/                 # UI Components
│   ├── index.ts               # Export all components
│   ├── template-modal/        # Template modal component
│   │   ├── index.ts          # Modal export
│   │   ├── template-modal.ts # Main modal logic
│   │   ├── template-dropdown.ts  # Template selection dropdown
│   │   └── prompt-input.ts   # Prompt input area
│   └── settings-tab.ts       # Settings UI
├── services/                  # Core services
│   ├── template-manager.ts   # Template file operations
│   ├── llm/                  # LLM integration
│   │   ├── index.ts         # Export LLM service
│   │   ├── llm-service.ts   # Main LLM service
│   │   ├── prompt-optimizer.ts  # Optimize user prompts
│   │   └── adapters/        # LLM API adapters
│   │       ├── index.ts     # Export adapters
│   │       ├── base.ts      # Base adapter interface
│   │       └── openai.ts    # OpenAI adapter (example)
│   └── file-service.ts      # File operations
└── utils/                    # Utilities
    ├── constants.ts         # Constants and config
    └── helpers.ts          # Helper functions