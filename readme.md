# Cascading Prompts

This library helps create verbose LLM code prompts from lightweight input 
prompts. It works by accepting an initial prompt and then augmenting it with the
following:

- Any shared prompts within the folder hierarchy are automatically added, thereby
  providing "cascading" prompts. A prompt saved to the top level
  directory will automatically be included in any generated prompt, whereas a
  shared prompt in the `models` folder will only be included in the generated model
  prompts.
- Any referenced symbols surrounded by the `$` character (e.g. `$UserDTO$`) will be
  looked up in the codebase and its source file will be included. The prompt
  will not be generated if the symbol cannot be found. If the symbol has instead
  not been generated yet, the script will iteratively keep trying until no
  further prompts can be generated.
- For extra context, the script also includes: 
    - a list of source files
    - import aliases
    - package dependencies

# Usage

## 1. Install

```zsh
# 1. install
yarn install ai-cascading-prompts
# 2. add OPENAI_API_KEY and OPENAI_GPT_MODEL_DEFAULT to your environment
```

## 2. Setup

The project directory will typically look as follows:

```txt
src/
├── .patterns/
│   └── index.pattern         // 1) applied to all prompts
└── models/
    ├── User.ts
    ├── .prompts/
    │   └── User.ts.prompt    // 3) prompt to create a user
    └── .patterns/
        └── index.pattern     // 2) applied to all model prompts
```

The contents of these files might be as follows:

1. Base prompt, applied to all prompts:
```txt
General code rules:
- No default exports
- Ensure all exports have a comment
```

2. Model prompt, applied to all model files (i.e. those in the `/models` folder)
```txt
All models should include a DTO interface and a model class.

DTOs should follow these rules:
- DTOs are interfaces.
- ...

Models should follow these rules:
- Models should be initialised using a DTO object. 
- Any sub-DTOs should be converted to their respective models.
...
```

3. Prompt to generate a User model:
```txt
Create a User model/DTO with the fields:
- id: string
- name: string
- dob: string (YYYY-MM-DD)
- createdAt: string/Date
- updatedAt: string/Date
```

## 3. Generate

```zsh
yarn ai-cascading-prompts
```

# Future work

- Handle other file types in the same directory, e.g. 
  - index.test.ts => applies to *.test.ts
  - index.stories.ts => applies to *.stories.ts
- Track if a prompt is newer than the file and regenerate
  - Pass the original file

## Other thoughts

- Swagger to prompts conversion
- Playbook: create multiple prompts from a single script
- Shared patterns files for common libraries, e.g. shadcn/ui
