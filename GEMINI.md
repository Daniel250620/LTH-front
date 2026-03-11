# LTH Front-end Project

## Project Overview

This is a modern web application built with **Next.js 16 (App Router)**, **React 19**, and **Tailwind CSS 4**. It is a TypeScript-based project designed for a chat-centric user experience, as evidenced by the `/chat` route.

### Key Technologies

- **Framework:** [Next.js 16](https://nextjs.org/)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) (using the new `@theme` configuration in CSS)
- **Type Safety:** [TypeScript](https://www.typescript.org/)
- **Optimization:** [React Compiler](https://react.dev/learn/react-compiler) (enabled via `babel-plugin-react-compiler`)

## Building and Running

### Development

To start the development server with Turbo mode enabled:

```bash
yarn dev
```

### Production

To build the application for production:

```bash
yarn build
```

To start the production server after building:

```bash
yarn start
```

### Linting

To run the ESLint checks:

```bash
yarn lint
```

## Development Conventions

### Architecture

- **App Router:** All routing and layouts should be managed within the `src/app` directory.
- **Components:** Place reusable UI components in a `src/components` directory (if not already present).
- **Styling:** Use Tailwind CSS utility classes. Custom theme variables are defined in `src/app/globals.css` using the Tailwind v4 `@theme` block.
- **Fonts:** Geist and Geist Mono are the primary fonts, integrated via `next/font`.

### SOLID Principles

The project follows the SOLID design principles to ensure a maintainable and scalable codebase:

- **S - Single Responsibility Principle:** Each component or function should have one, and only one, reason to change. Separate UI logic from business logic.
- **O - Open/Closed Principle:** Software entities (classes, modules, functions) should be open for extension but closed for modification. Use composition and props to extend component behavior.
- **L - Liskov Substitution Principle:** Objects of a superclass should be replaceable with objects of its subclasses without breaking the application. Ensure that extended components maintain the same contract as their base.
- **I - Interface Segregation Principle:** No client should be forced to depend on methods it does not use. Use specific and concise TypeScript interfaces/types for props.
- **D - Dependency Inversion Principle:** Depend upon abstractions, not concretions. Use hooks and context for dependency injection and state management.

### Code Quality

- **TypeScript:** Always use TypeScript for new files. Define interfaces/types for props and state.
- **Linting:** Adhere to the rules defined in `eslint.config.mjs` (extending `next/core-web-vitals`).
- **Formatting:** Follow standard Prettier/ESLint formatting conventions established in the project.

### Chat Feature

The `/chat` route (`src/app/chat/page.tsx`) currently serves as a layout prototype using a CSS Grid system. Future development should build upon this structure for the messaging interface.
