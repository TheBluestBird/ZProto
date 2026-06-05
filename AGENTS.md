# Overview

This project is an idle game about a tower of zeppelins.
We need to create a frontend only prototype of the game.
The type is a SPA

# Stack

- Typescript (see `.cursor/rules/typescript-standards.mdc`)
- Vite
- React 19
- Tailwind (primary styling for layout and positioning; see `.cursor/rules/css-tailwind.mdc`)

# Structure

- concept: exports ideas of the designer, never include files directly from here, always copy when needed, rename to match thee purpose
- concept/doc: documents from the game designer
- concept/art: art concepts of the game visuals
- concept/temp: temporary dir

- src: source code
- src/app: application root
- src/components: self sufficient components. The entry point of the component is index.tsx, all component files contained in the directory. Directory of the component must start from the capital, for example: Frame
- src/pages: The pages of the SPA
- src/navigation: Navigation related tools
- src/game: Background game logics

- doc: established concepts that need to be taken to consideration
- doc/spec: specs that has are either in progress or have been complete. Each spec must be a directory, have phases.md as an overall plan and the status of the spec, the rest of the files inside of that directory are considered phase plans. Do this structure even if the spec is only one state.

# Ground rules

- There is a component for the debug menu (src/components/DebugPanel): it is called with the double click on the player level, all debug buttons must go there
- All the global state is in src/game, it is prohibited to define game state structure outside of that directory and manage states anywhere but there.
- If there is a change into a state of the player - the developer must define the migration to the new level of the state in src/game/persist/migration
- It is prohibited to use in place components and UI elements. Common UI elements must be defined in /src/components, child components intended to be used along with it's parent must be defined within the directory of the parent
- Defining a component make sure there is no component that is suitable for the task you are solving, if there is - prefer to use it and extend it, but not significantly!
- Defining or editing a component follow the following procedure:
    - if a component is simple - just create it as a file, starting with a Capital letter
    - if for a component you need more than one file or plan to use assets create a directory starting with the Capital letter, locate all the files there, make index.tsx with the component root.
    - prefer splitting the logics and responsibilities but avoid useless wrapper components or functions consisting of 3 - 5 lines of code.
    - it is prohibited to use component assets outside of the component directory.
    - keep the layout as simple as possible, avoid useless wrappers, never use BEM syntax, prefer Tailwind standard styles, avoid classes with [].
    - you may use index.css for the component only if this is a better way to describe custom layout styles of the component or it's visual complexity.
    - prefer styles defined in src/index.css for better support of the theming. Prefer deriving colors from defined to create gradients shadows and background. DO not define new constants, do not define custom overprecise offsets margins paddings font spacing line hights and try to adjust styles to the bare minimum. Consistency and extensibility is better than component perfection